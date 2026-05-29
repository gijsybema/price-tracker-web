"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import type { PricePoint } from "../lib/products";

type Props = {
  data: PricePoint[];
};

type Days = 30 | 60 | 90;

// Show 0 decimals for ≥€100, 0 decimals for whole numbers, 2 decimals otherwise
function fmt(price: number): string {
  if (price >= 100 || price === Math.floor(price)) return String(Math.round(price));
  return price.toFixed(2).replace(".", ",");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

/** Format a Date as YYYY-MM-DD in local time (avoids UTC offset shifting the day). */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// SVG viewBox dimensions — used only for internal coordinate math
const W = 800;
const H = 200;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const CHART_W = W - PAD_LEFT - PAD_RIGHT;
const CHART_H = H - PAD_TOP - PAD_BOTTOM;

// Convert SVG viewBox coordinates to CSS % so HTML labels align with SVG geometry.
// Works because preserveAspectRatio="none" scales linearly in both axes.
const svgXPct = (x: number) => `${(x / W) * 100}%`;
const svgYPct = (y: number) => `${(y / H) * 100}%`;

// ── Axis helpers ──────────────────────────────────────────────────────────────

/** Pick a clean tick interval for a given range (~4 ticks target). */
function niceInterval(range: number): number {
  const rough = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  if (norm < 1.5) return mag;
  if (norm < 3) return 2 * mag;
  if (norm < 7) return 5 * mag;
  return 10 * mag;
}

/**
 * Compute Y-axis bounds and tick values.
 * Enforces a minimum chart range of 8% of the price level so that tiny
 * variations (e.g. €217–€222) don't appear as dramatic swings.
 */
function computeAxisBounds(prices: number[]): { yMin: number; yMax: number; ticks: number[] } {
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const dataRange = maxP - minP;

  const chartRange = Math.max(dataRange * 1.2, maxP * 0.08);
  const mid = (maxP + minP) / 2;

  const rawYMin = Math.max(0, mid - chartRange / 2);
  const rawYMax = mid + chartRange / 2;

  const interval = niceInterval(rawYMax - rawYMin);
  const yMin = Math.floor(rawYMin / interval) * interval;
  const yMax = Math.ceil(rawYMax / interval) * interval;

  // Build ticks without floating-point drift
  const count = Math.round((yMax - yMin) / interval);
  const ticks = Array.from({ length: count + 1 }, (_, i) =>
    Math.round((yMin + i * interval) * 1000) / 1000
  );

  return { yMin, yMax, ticks };
}

/**
 * Generate dates for vertical grid lines.
 * 30-day view: weekly (every Monday).
 * 60/90-day view: monthly (1st of each month).
 */
function verticalGridDates(rangeStartMs: number, rangeEndMs: number, days: Days): string[] {
  const dates: string[] = [];

  if (days === 30) {
    // Advance to the first Monday after rangeStart
    const d = new Date(rangeStartMs);
    const dow = d.getDay(); // 0=Sun … 6=Sat
    const advance = (8 - dow) % 7 || 7; // days until next Monday (never 0)
    d.setDate(d.getDate() + advance);
    while (d.getTime() <= rangeEndMs) {
      dates.push(localDateStr(d));
      d.setDate(d.getDate() + 7);
    }
  } else {
    // 1st of each month that falls within the range
    const start = new Date(rangeStartMs);
    const d = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    while (d.getTime() <= rangeEndMs) {
      dates.push(localDateStr(d));
      d.setMonth(d.getMonth() + 1);
    }
  }

  return dates;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PriceHistoryChart({ data }: Props) {
  // A period is useful only if data extends BEYOND the next shorter period —
  // i.e. switching to it actually reveals more history.
  // 60d useful: data has points older than 30 days ago.
  // 90d useful: data has points older than 60 days ago.
  const availablePeriods = useMemo(() => {
    const set = new Set<Days>([30]);
    const c30 = new Date(); c30.setDate(c30.getDate() - 30);
    const c60 = new Date(); c60.setDate(c60.getDate() - 60);
    if (data.some((p) => p.date < localDateStr(c30))) set.add(60);
    if (data.some((p) => p.date < localDateStr(c60))) set.add(90);
    return set;
  }, [data]);

  // Default to the longest useful period, using the same logic inline.
  const [days, setDays] = useState<Days>(() => {
    const c60 = new Date(); c60.setDate(c60.getDate() - 60);
    if (data.some((p) => p.date < localDateStr(c60))) return 90;
    const c30 = new Date(); c30.setDate(c30.getDate() - 30);
    if (data.some((p) => p.date < localDateStr(c30))) return 60;
    return 30;
  });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: PricePoint } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const filtered = data.filter((p) => p.date >= cutoffStr);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (filtered.length < 2 || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * W;
      const chartX = mouseX - PAD_LEFT;

      const prices = filtered.map((p) => Number(p.price));
      const { yMin, yMax } = computeAxisBounds(prices);

      const rStart = new Date(filtered[0].date + "T00:00:00").getTime();
      const rEnd = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime();
      const rSpan = rEnd - rStart || 1;

      let closest = filtered[0];
      let closestDist = Infinity;
      for (const p of filtered) {
        const px = ((new Date(p.date + "T00:00:00").getTime() - rStart) / rSpan) * CHART_W;
        if (Math.abs(px - chartX) < closestDist) {
          closestDist = Math.abs(px - chartX);
          closest = p;
        }
      }

      const px =
        PAD_LEFT +
        ((new Date(closest.date + "T00:00:00").getTime() - rStart) / rSpan) * CHART_W;
      const py =
        PAD_TOP + CHART_H - ((Number(closest.price) - yMin) / (yMax - yMin)) * CHART_H;

      setTooltip({ x: px, y: py, point: closest });
    },
    [filtered]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (filtered.length < 2) {
    return (
      <div className="mt-6">
        <ToggleBar days={days} setDays={setDays} availablePeriods={availablePeriods} />
        <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-400">
          Onvoldoende data voor deze periode
        </div>
      </div>
    );
  }

  const prices = filtered.map((p) => Number(p.price));
  const { yMin, yMax, ticks } = computeAxisBounds(prices);

  // X range: first data point → today
  const rangeStart = new Date(filtered[0].date + "T00:00:00").getTime();
  const rangeEnd = new Date(todayStr + "T00:00:00").getTime();
  const rangeSpan = rangeEnd - rangeStart || 1;

  const toX = (dateStr: string) =>
    PAD_LEFT + ((new Date(dateStr + "T00:00:00").getTime() - rangeStart) / rangeSpan) * CHART_W;
  const toY = (price: number) =>
    PAD_TOP + CHART_H - ((price - yMin) / (yMax - yMin)) * CHART_H;

  // Build chart path — pen-lift on gaps > 1 day
  let pathD = "";
  let areaD = "";
  for (let i = 0; i < filtered.length; i++) {
    const p = filtered[i];
    const x = toX(p.date);
    const y = toY(Number(p.price));
    if (i === 0) {
      pathD += `M ${x} ${y}`;
      areaD += `M ${x} ${PAD_TOP + CHART_H} L ${x} ${y}`;
    } else {
      const gap =
        (new Date(p.date + "T00:00:00").getTime() -
          new Date(filtered[i - 1].date + "T00:00:00").getTime()) /
        86400000;
      if (gap > 1) {
        const prevX = toX(filtered[i - 1].date);
        areaD += ` L ${prevX} ${PAD_TOP + CHART_H} Z M ${x} ${PAD_TOP + CHART_H} L ${x} ${y}`;
        pathD += ` M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
        areaD += ` L ${x} ${y}`;
      }
    }
  }
  areaD += ` L ${toX(filtered[filtered.length - 1].date)} ${PAD_TOP + CHART_H} Z`;

  const vGridDates = verticalGridDates(rangeStart, rangeEnd, days);

  const tooltipOnRight = tooltip !== null && tooltip.x / W > 0.7;

  return (
    <div className="mt-6">
      <ToggleBar days={days} setDays={setDays} availablePeriods={availablePeriods} />

      <div className="relative mt-4 aspect-[2/1] overflow-hidden rounded-xl border border-gray-200 bg-white sm:aspect-[4/1]">

        {/* SVG — geometry only, no text */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={PAD_LEFT} y1={toY(tick)}
              x2={W - PAD_RIGHT} y2={toY(tick)}
              stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3"
            />
          ))}

          {/* Vertical grid lines — calendar-aware */}
          {vGridDates.map((dateStr) => {
            const x = toX(dateStr);
            return (
              <line
                key={dateStr}
                x1={x} y1={PAD_TOP}
                x2={x} y2={PAD_TOP + CHART_H}
                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Price line */}
          <path
            d={pathD}
            fill="none" stroke="#2563eb" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"
          />

          {/* Tooltip indicator */}
          {tooltip && (
            <>
              <line
                x1={tooltip.x} y1={PAD_TOP}
                x2={tooltip.x} y2={PAD_TOP + CHART_H}
                stroke="#2563eb" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"
              />
              <circle
                cx={tooltip.x} cy={tooltip.y}
                r="4" fill="#2563eb" stroke="white" strokeWidth="2"
              />
            </>
          )}

          {/* Mouse tracking overlay */}
          <rect
            x={PAD_LEFT} y={PAD_TOP}
            width={CHART_W} height={CHART_H}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </svg>

        {/* Y-axis labels — HTML so font is always 12px regardless of chart scale */}
        {ticks.map((tick) => (
          <div
            key={tick}
            className="pointer-events-none absolute text-right text-xs leading-none text-gray-400"
            style={{
              left: 0,
              width: svgXPct(PAD_LEFT - 4),
              top: svgYPct(toY(tick)),
              transform: "translateY(-50%)",
              paddingRight: "4px",
            }}
          >
            €{fmt(tick)}
          </div>
        ))}

        {/* Tooltip box */}
        {tooltip && (
          <div
            className="pointer-events-none absolute rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md"
            style={{
              top: svgYPct(PAD_TOP),
              ...(tooltipOnRight
                ? { right: svgXPct(PAD_RIGHT + 4) }
                : { left: svgXPct(PAD_LEFT + 4) }),
            }}
          >
            <p className="font-semibold text-gray-900">€{fmt(Number(tooltip.point.price))}</p>
            <p className="text-gray-400">{formatDate(tooltip.point.date)}</p>
          </div>
        )}
      </div>

      {/* X-axis labels — sibling div to avoid overlap with Y labels.
          Start/end labels are edge-aligned; vertical grid labels are centered on their line. */}
      <div className="relative mt-1 h-5 text-xs text-gray-400">
        {/* Start date — left-aligned at chart left edge */}
        <span className="absolute" style={{ left: svgXPct(PAD_LEFT) }}>
          {formatDateShort(filtered[0].date)}
        </span>

        {/* Vertical grid labels — centered on each grid line, hidden on mobile to avoid overlap.
            Suppressed when too close to the start/end labels to prevent overlap. */}
        {vGridDates.map((dateStr) => {
          const x = toX(dateStr);
          const tooClose = x - PAD_LEFT < 70 || (W - PAD_RIGHT) - x < 70;
          if (tooClose) return null;
          return (
            <span
              key={dateStr}
              className="absolute hidden -translate-x-1/2 whitespace-nowrap sm:inline"
              style={{ left: svgXPct(x) }}
            >
              {formatDateShort(dateStr)}
            </span>
          );
        })}

        {/* End date — right-aligned at chart right edge */}
        <span
          className="absolute -translate-x-full"
          style={{ left: svgXPct(W - PAD_RIGHT) }}
        >
          {formatDateShort(todayStr)}
        </span>
      </div>
    </div>
  );
}

function ToggleBar({
  days,
  setDays,
  availablePeriods = new Set<Days>([30, 60, 90]),
}: {
  days: Days;
  setDays: (d: Days) => void;
  availablePeriods?: Set<Days>;
}) {
  return (
    <div className="flex gap-2">
      {([30, 60, 90] as Days[]).map((d) => {
        const available = availablePeriods.has(d);
        return (
          <button
            key={d}
            onClick={() => available && setDays(d)}
            disabled={!available}
            className={`rounded-full px-4 py-1 text-sm font-medium transition ${
              days === d
                ? "bg-blue-600 text-white"
                : available
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "cursor-not-allowed bg-gray-100 text-gray-300"
            }`}
          >
            {d} dagen
          </button>
        );
      })}
    </div>
  );
}

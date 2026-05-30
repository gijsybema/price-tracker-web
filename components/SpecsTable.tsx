type SpecDef = { label: string; key: string };

const SPEC_DEFS: Record<string, SpecDef[]> = {
  headphones: [
    { label: "Noise cancelling", key: "noise_cancelling" },
    { label: "Kwaliteit noise cancelling", key: "noise_cancelling_quality" },
    { label: "Gemiddelde accuduur", key: "battery_life" },
    { label: "Waterbestendig", key: "water_resistant" },
    { label: "Bluetooth", key: "bluetooth" },
    { label: "Bluetooth-versie", key: "bluetooth_version" },
    { label: "Ingebouwde microfoon", key: "built_in_microphone" },
    { label: "Type oorkussen", key: "ear_cup_type" },
    { label: "Geluidsweergave", key: "audio_rendering" },
    { label: "Gewicht in gram", key: "weight_grams" },
    { label: "Kleur", key: "color" },
    { label: "Materiaal", key: "material" },
    { label: "Type stroomvoorziening", key: "power_type" },
    { label: "Kabel los te koppelen", key: "detachable_cable" },
  ],
  earbuds: [
    { label: "Noise cancelling", key: "noise_cancelling" },
    { label: "Kwaliteit noise cancelling", key: "noise_cancelling_quality" },
    { label: "Gemiddelde accuduur", key: "battery_life" },
    { label: "Accuduur case", key: "battery_life_case" },
    { label: "Waterbestendig", key: "water_resistant" },
    { label: "IP-certificering", key: "ip_rating" },
    { label: "Bluetooth", key: "bluetooth" },
    { label: "Bluetooth-versie", key: "bluetooth_version" },
    { label: "Volledig draadloze oordopjes", key: "fully_wireless" },
    { label: "Multipoint pairing", key: "multipoint_pairing" },
    { label: "Draadloos opladen", key: "wireless_charging" },
    { label: "Oplaadcase", key: "charging_case" },
    { label: "Ingebouwde microfoon", key: "built_in_microphone" },
    { label: "Type oorkussen", key: "ear_cup_type" },
    { label: "Geluidsweergave", key: "audio_rendering" },
    { label: "Gewicht in gram", key: "weight_grams" },
    { label: "Kleur", key: "color" },
    { label: "Materiaal", key: "material" },
    { label: "Type stroomvoorziening", key: "power_type" },
  ],
  speakers: [
    { label: "Type speaker", key: "speaker_type" },
    { label: "Formaat draadloze speaker", key: "speaker_size" },
    { label: "Gemiddelde accuduur", key: "battery_life" },
    { label: "Maximale accu/batterijduur", key: "battery_life_max" },
    { label: "IP-certificering", key: "ip_rating" },
    { label: "Waterdichtheid", key: "water_resistance" },
    { label: "Wifi ingebouwd", key: "wifi" },
    { label: "Multiroom audio", key: "multiroom" },
    { label: "Bluetooth", key: "bluetooth" },
    { label: "Geluidsweergave", key: "audio_rendering" },
    { label: "Bediening via app", key: "app_control" },
    { label: "Ingebouwde microfoon", key: "built_in_microphone" },
    { label: "NFC", key: "nfc" },
    { label: "Radio", key: "radio" },
    { label: "Afstandsbediening", key: "remote_control" },
    { label: "Bediening via knoppen op apparaat", key: "physical_controls" },
    { label: "Gewicht", key: "weight" },
    { label: "Kleur", key: "color" },
  ],
  soundbars: [
    { label: "Aantal audio kanalen", key: "audio_channels" },
    { label: "Aantal subwooferkanalen", key: "subwoofer_channels" },
    { label: "Losse subwoofer", key: "separate_subwoofer" },
    { label: "Surround sound", key: "surround_sound" },
    { label: "Hi-res audio", key: "hi_res_audio" },
    { label: "Geluidsweergave", key: "audio_rendering" },
    { label: "HDMI ARC (Audio Return Channel)", key: "hdmi_arc" },
    { label: "HDMI-aansluiting", key: "hdmi" },
    { label: "Wifi ingebouwd", key: "wifi" },
    { label: "Multiroom audio", key: "multiroom" },
    { label: "Bluetooth", key: "bluetooth" },
    { label: "Spotify Connect", key: "spotify_connect" },
    { label: "AirPlay", key: "airplay" },
    { label: "Google Cast", key: "google_cast" },
    { label: "Speelt van netwerk", key: "plays_from_network" },
    { label: "Compatibel met smartphone / apps", key: "smartphone_compatible" },
    { label: "Smart home platform", key: "smart_home_platform" },
    { label: "Bediening via app", key: "app_control" },
    { label: "NFC", key: "nfc" },
    { label: "Radio", key: "radio" },
    { label: "Gewicht", key: "weight" },
    { label: "Kleur", key: "color" },
  ],
};

type Props = {
  category: string;
  specs: Record<string, unknown> | null;
};

export default function SpecsTable({ category, specs }: Props) {
  if (!specs) return null;

  const defs = SPEC_DEFS[category];
  if (!defs) return null;

  const rows = defs.filter(({ key }) => {
    const v = specs[key];
    return v !== undefined && v !== null && v !== "";
  });

  if (rows.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900">Specificaties</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map(({ label, key }) => (
          <div key={key} className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-200 to-white px-4 py-3">
            <p className="break-words text-xs text-gray-500">{label}</p>
            <p className="mt-1 break-words text-sm font-medium text-gray-900">{String(specs[key])}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

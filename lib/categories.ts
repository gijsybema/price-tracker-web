export const CATEGORY_SLUGS = ["headphones", "earbuds", "speakers", "soundbars"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  headphones: "Koptelefoons",
  earbuds: "Oordopjes",
  speakers: "Speakers",
  soundbars: "Soundbars",
};

export const CATEGORY_DESCRIPTIONS: Record<CategorySlug, string> = {
  headphones: "Over-ear en on-ear modellen van bekende merken, inclusief noise cancelling.",
  earbuds: "Draadloze oordopjes voor onderweg, sport en dagelijks gebruik.",
  speakers: "Bluetooth- en smart speakers voor thuis en onderweg.",
  soundbars: "Soundbars voor een betere tv-geluidservaring in huis.",
};

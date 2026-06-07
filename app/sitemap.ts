import { getAllActiveProductSlugs } from "../lib/products";

const BASE_URL = "https://techtracker.nl";

const STATIC_PAGES = [
  { url: BASE_URL, priority: 1.0 },
  { url: `${BASE_URL}/deals`, priority: 0.9 },
  { url: `${BASE_URL}/products`, priority: 0.8 },
  { url: `${BASE_URL}/headphones`, priority: 0.8 },
  { url: `${BASE_URL}/earbuds`, priority: 0.8 },
  { url: `${BASE_URL}/speakers`, priority: 0.8 },
  { url: `${BASE_URL}/soundbars`, priority: 0.8 },
  { url: `${BASE_URL}/about`, priority: 0.4 },
  { url: `${BASE_URL}/how-it-works`, priority: 0.4 },
  { url: `${BASE_URL}/privacy`, priority: 0.3 },
  { url: `${BASE_URL}/terms`, priority: 0.3 },
  { url: `${BASE_URL}/contact`, priority: 0.3 },
];

export default async function sitemap() {
  const products = await getAllActiveProductSlugs();

  const productEntries = products.map(({ category, slug }) => ({
    url: `${BASE_URL}/${category}/${slug}`,
    priority: 0.7,
  }));

  return [...STATIC_PAGES, ...productEntries].map((entry) => ({
    ...entry,
    lastModified: new Date(),
  }));
}

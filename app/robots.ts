export default function robots() {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://techtracker.nl/sitemap.xml",
    };
  }
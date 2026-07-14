import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/profile", "/mylistings", "/place-add", "/saved-forms", "/notifications"],
      },
    ],
    sitemap: "https://hulucars.com/sitemap.xml",
  };
}

import { Endpoint } from "payload";

export const faviconHandler: Endpoint["handler"] = async (req) => {
  try {
    const payload = req.payload;
    const settings = await payload.findGlobal({
      slug: "app-settings",
    });

    if (settings?.shortLogo && typeof settings.shortLogo === "object" && settings.shortLogo.url) {
      let url = settings.shortLogo.url;
      if (url.startsWith("/")) {
        const reqUrl = req.url || `http://localhost:3001`;
        const origin = new URL(reqUrl).origin;
        url = `${origin}${url}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const svgText = await res.text();
        return new Response(svgText, {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }
  } catch (err) {
    console.error("Error serving dynamic favicon:", err);
  }

  // Fallback to empty svg or standard payload icon
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">RX</text></svg>`,
    {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
      },
    }
  );
};

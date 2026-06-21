import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/payload-fetcher";

// Fallback SVG if CMS has no short logo
const fallbackSvg = `<?xml version="1.0" standalone="no"?>
<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1070.000000pt" height="454.000000pt" viewBox="0 0 1070.000000 454.000000" preserveAspectRatio="xMidYMid meet">
<style>
  path { fill: #059669; }
  @media (prefers-color-scheme: dark) {
    path { fill: #10b981; }
  }
</style>
<g transform="translate(0.000000,454.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M365 4268 c-3 -7 -4 -911 -3 -2008 l3 -1995 598 -3 597 -2 0 699 0 699 23 6 c38 10 1547 7 1566 -4 10 -5 45 -56 77 -112 32 -57 65 -114 74 -128 9 -14 31 -50 47 -80 17 -30 90 -158 163 -285 73 -126 143 -248 156 -270 12 -22 85 -148 161 -280 l138 -240 623 -3 c342 -1 622 2 622 6 0 5 -39 76 -86 158 -48 82 -96 165 -106 184 -11 19 -24 40 -28 45 -4 6 -21 35 -37 65 -24 43 -308 539 -393 685 -117 200 -180 317 -180 333 0 14 19 28 70 51 39 17 73 31 75 31 3 0 47 28 98 62 309 206 519 527 582 888 66 377 -67 802 -344 1093 -153 160 -345 282 -546 345 -122 38 -177 48 -325 62 -180 16 -3619 14 -3625 -2z m3588 -1199 c51 -26 67 -51 67 -100 0 -40 -4 -51 -31 -73 -17 -14 -40 -26 -52 -26 -12 1 -543 -2 -1180 -5 -803 -4 -1164 -2 -1177 5 -18 9 -20 21 -20 98 0 55 4 92 12 100 17 17 2349 17 2381 1z"/>
<path d="M5307 4274 c-7 -7 6 -23 237 -289 77 -88 229 -265 339 -393 110 -128 204 -231 208 -230 4 2 26 26 50 55 77 91 460 534 569 658 135 154 160 184 160 196 0 10 -1553 13 -1563 3z"/>
<path d="M8755 4272 c-6 -4 -67 -72 -136 -152 -269 -313 -448 -520 -542 -630 -55 -63 -116 -133 -136 -155 -20 -22 -61 -70 -91 -105 -130 -153 -293 -343 -305 -356 -16 -17 -606 -702 -645 -749 -19 -23 -132 -154 -250 -291 -118 -136 -357 -413 -530 -614 -654 -761 -790 -917 -805 -930 -8 -7 -15 -16 -15 -21 0 -5 345 -9 794 -9 l794 0 265 308 c145 169 367 427 493 573 126 146 364 423 530 615 165 192 374 435 464 539 330 383 530 615 715 828 105 120 204 235 220 256 17 20 71 83 120 140 50 57 108 125 130 152 22 26 135 157 250 290 292 337 267 306 249 313 -23 9 -1557 7 -1569 -2z"/>
<path d="M8647 2022 c-124 -144 -443 -519 -496 -581 -25 -30 -75 -89 -110 -130 -36 -42 -71 -84 -79 -93 -13 -16 -11 -22 24 -65 21 -27 41 -50 44 -53 3 -3 30 -34 60 -70 30 -36 57 -67 60 -70 4 -3 89 -102 190 -220 101 -118 189 -220 195 -226 5 -6 57 -66 113 -132 l104 -122 789 0 c494 0 789 4 789 10 0 5 -44 59 -97 121 -54 62 -116 133 -138 160 -22 26 -134 157 -250 290 -338 390 -655 758 -880 1022 -115 135 -216 248 -222 251 -7 3 -48 -36 -96 -92z"/>
</g>
</svg>`;

export async function GET() {
  try {
    const settings = await getAppSettings();

    // If there's an uploaded short logo, fetch it and inject the style
    if (
      settings?.shortLogo &&
      typeof settings.shortLogo === "object" &&
      settings.shortLogo.url
    ) {
      const res = await fetch(settings.shortLogo.url);
      if (res.ok) {
        let svgText = await res.text();

        // Strip hardcoded fills
        svgText = svgText.replace(/fill="[^"]+"/g, "");

        // Inject primary color styles
        const styleBlock = `
<style>
  path, circle, rect, polygon, line, polyline { fill: #059669; }
  @media (prefers-color-scheme: dark) {
    path, circle, rect, polygon, line, polyline { fill: #10b981; }
  }
</style>
`;
        // Insert style after opening <svg> tag
        svgText = svgText.replace(/(<svg[^>]*>)/i, `$1${styleBlock}`);

        return new NextResponse(svgText, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }
  } catch (error) {
    console.error("Error generating dynamic favicon:", error);
  }

  // Fallback if no short logo configured
  return new NextResponse(fallbackSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

import React from "react";

interface DynamicSvgProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
}

export async function DynamicSvg({ url, className, ...props }: DynamicSvgProps) {
  let svgText: string | null = null;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      let text = await res.text();
      
      // Strip out fill attributes and replace them
      text = text.replace(/fill="[^"]+"/g, 'fill="currentColor"');
      
      // Ensure <svg> doesn't have explicit width/height that overrides CSS
      text = text.replace(/width="[^"]+"/, "");
      text = text.replace(/height="[^"]+"/, "");

      // Find the opening <svg tag and add the className
      const cls = className ? `class="${className}" ` : "";
      text = text.replace(/<svg /, `<svg ${cls}`);
      
      svgText = text;
    }
  } catch (e) {
    console.error("Failed to fetch DynamicSvg:", e);
  }

  if (!svgText) {
    return null;
  }

  return (
    <div
      className="contents"
      dangerouslySetInnerHTML={{ __html: svgText }}
      {...props}
    />
  );
}

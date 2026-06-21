import React from 'react';
import { getPayload } from 'payload';
import configPromise from '../payload.config';

/**
 * Sanitize SVG: remove hardcoded dimensions, inject inline styles for size/color.
 * We use inline styles instead of Tailwind classes because the SVG is injected via
 * dangerouslySetInnerHTML — Tailwind v4's JIT scanner cannot detect classes in
 * runtime HTML strings, so those classes would have no CSS definitions.
 */
function prepareSvg(svgText: string, style: string): string {
  // Remove XML declaration and DOCTYPE if present
  let svg = svgText.replace(/<\?xml[^?]*\?>\s*/g, '');
  svg = svg.replace(/<!DOCTYPE[^>]*>\s*/g, '');

  // Remove hardcoded width/height attributes (keep viewBox for proper scaling)
  svg = svg.replace(/\s+width="[^"]*"/g, '');
  svg = svg.replace(/\s+height="[^"]*"/g, '');

  // Replace all fill colors with currentColor so we can control via CSS color
  svg = svg.replace(/fill="[^"]+"/g, 'fill="currentColor"');

  // Inject inline style on the <svg> tag
  svg = svg.replace(/<svg\b/, `<svg style="${style}"`);

  return svg;
}

export const AdminLogo = async () => {
  let finalHtml: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({
      slug: 'app-settings',
    });

    if (settings?.fullLogo && typeof settings.fullLogo === 'object' && settings.fullLogo.url) {
      const res = await fetch(settings.fullLogo.url);
      if (res.ok) {
        const svgText = await res.text();
        finalHtml = prepareSvg(
          svgText,
          'height: 2.5rem; width: auto; display: block;'
        );
      }
    }
  } catch (e) {
    console.error("Error loading AdminLogo:", e);
  }

  if (finalHtml) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center' }}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />
    );
  }

  // Fallback
  return <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>BDS CMS</div>;
};

export const AdminIcon = async () => {
  let finalHtml: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({
      slug: 'app-settings',
    });

    if (settings?.shortLogo && typeof settings.shortLogo === 'object' && settings.shortLogo.url) {
      const res = await fetch(settings.shortLogo.url);
      if (res.ok) {
        const svgText = await res.text();
        finalHtml = prepareSvg(
          svgText,
          'height: 2rem; width: 2rem; display: block;'
        );
      }
    }
  } catch (e) {
    console.error("Error loading AdminIcon:", e);
  }

  if (finalHtml) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />
    );
  }

  // Fallback
  return <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>RX</div>;
};

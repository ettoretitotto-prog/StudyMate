"use client";

import { useEffect, useRef } from "react";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";

interface MarkmapPreviewProps {
  content: string;
  title?: string;
}

const MARKMAP_OPTIONS: Partial<Parameters<typeof Markmap.create>[1]> = {
  style: () => `
    .markmap {
      --markmap-text-color: #ffffff;
      --markmap-code-color: #ffffff;
      --markmap-code-bg: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }
    .markmap-foreign,
    .markmap-foreign div {
      color: #ffffff;
    }
    .markmap-node {
      cursor: pointer;
    }
  `,
  zoom: true,
  pan: true,
};

export function MarkmapPreview({ content, title }: MarkmapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markmapRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Only render if there's actual content
    const markdownContent = title ? `# ${title}\n${content}` : content;
    if (!markdownContent.trim()) return;

    // Ensure SVG element exists
    let svg = svgRef.current;
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "width: 100%; height: 100%;");
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(svg);
      svgRef.current = svg;
    }

    try {
      const transformer = new Transformer();
      const { root } = transformer.transform(markdownContent);

      if (!markmapRef.current) {
        markmapRef.current = Markmap.create(svg, MARKMAP_OPTIONS, root);
      } else {
        markmapRef.current.setOptions(MARKMAP_OPTIONS);
        markmapRef.current.setData(root);
      }

      // Auto-fit after a short delay to ensure rendering
      setTimeout(() => {
        markmapRef.current?.fit();
      }, 100);
    } catch (error) {
      console.error("Error rendering markmap:", error);
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div style="padding: 20px; color: #999;">Errore nel rendering della mappa</div>';
      }
    }
  }, [content, title]);

  return (
    <div
      ref={containerRef}
      className="markmap-dark h-full w-full bg-gradient-to-br from-background to-muted/20"
      style={{
        minHeight: "400px"
      }}
    />
  );
}

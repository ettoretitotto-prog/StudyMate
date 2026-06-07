"use client";

import { useEffect, useRef } from "react";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";

interface MarkmapPreviewProps {
  content: string;
  title?: string;
}

export function MarkmapPreview({ content, title }: MarkmapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markmapRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (!containerRef.current || !content.trim()) {
      return;
    }

    // Create transformer
    const transformer = new Transformer();

    try {
      // Prepare markdown with title
      const markdownContent = title ? `# ${title}\n${content}` : content;

      // Transform markdown to AST
      const { root } = transformer.transform(markdownContent);

      // Initialize or update Markmap
      if (!markmapRef.current && containerRef.current) {
        markmapRef.current = new Markmap(containerRef.current);
        markmapRef.current.setData(root);
        markmapRef.current.fit();
      } else if (markmapRef.current) {
        markmapRef.current.setData(root);
        markmapRef.current.fit();
      }
    } catch (error) {
      console.error("Error rendering markmap:", error);
    }
  }, [content, title]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-background"
      style={{
        minHeight: "400px"
      }}
    />
  );
}

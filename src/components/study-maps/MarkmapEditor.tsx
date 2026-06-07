"use client";

interface MarkmapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function MarkmapEditor({ content, onChange, placeholder }: MarkmapEditorProps) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-full w-full resize-none border-0 bg-background p-4 font-mono text-sm outline-none focus:ring-0"
      spellCheck="false"
      style={{
        lineHeight: "1.6"
      }}
    />
  );
}

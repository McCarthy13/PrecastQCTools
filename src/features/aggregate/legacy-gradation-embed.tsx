'use client';

export function LegacyGradationEmbed() {
  return (
    <div className="h-full w-full">
      <iframe
        src="/legacy-gradation.html"
        title="Aggregate Gradation Analysis"
        className="h-[calc(100vh-160px)] w-full border-0"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}

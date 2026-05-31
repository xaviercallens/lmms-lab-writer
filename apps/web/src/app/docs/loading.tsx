const SKELETON_SECTIONS = [
  { id: "getting-started", cardIds: ["getting-started-1", "getting-started-2"] },
  { id: "features", cardIds: ["features-1", "features-2"] },
  { id: "reference", cardIds: ["reference-1", "reference-2", "reference-3"] },
];

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-background sticky top-0 z-50 px-4 sm:px-6">
        <div className="w-full max-w-5xl mx-auto py-3 sm:py-4 flex items-center justify-between">
          <div className="h-6 w-32 bg-neutral-100 animate-pulse" />
          <div className="h-8 w-24 bg-neutral-100 animate-pulse" />
        </div>
      </header>
      <main className="flex-1 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="h-7 w-48 bg-neutral-100 animate-pulse mb-2" />
          <div className="h-4 w-72 bg-neutral-50 animate-pulse mb-12" />
          <div className="space-y-10">
            {SKELETON_SECTIONS.map((section) => (
              <div key={section.id}>
                <div className="h-3 w-28 bg-neutral-100 animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.cardIds.map((cardId) => (
                    <div key={cardId} className="border border-border p-5">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-8 h-8 bg-neutral-100 animate-pulse shrink-0" />
                        <div className="h-4 w-24 bg-neutral-100 animate-pulse" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-3 w-full bg-neutral-50 animate-pulse" />
                        <div className="h-3 w-3/4 bg-neutral-50 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-[18px] border border-border bg-card p-8 shadow-soft">
        <div className="h-8 w-40 rounded-full bg-muted" />
        <div className="mt-8 h-12 w-3/4 rounded-full bg-muted" />
        <div className="mt-4 h-5 w-full rounded-full bg-muted" />
        <div className="mt-3 h-5 w-2/3 rounded-full bg-muted" />
      </div>
    </main>
  );
}

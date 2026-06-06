"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

export function SearchForm({ placeholder = "Search disputes..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = React.useState(currentQuery);

  React.useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    const target = value ? `/disputes?q=${encodeURIComponent(value)}` : "/disputes";
    router.push(target);
  }

  function clear() {
    setQuery("");
    if (pathname === "/disputes") {
      router.push("/disputes");
    }
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className="hidden h-11 w-full max-w-md items-center gap-3 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground md:flex"
    >
      <button type="submit" aria-label="Search disputes" className="text-muted-foreground transition-colors hover:text-primary">
        <Search className="size-5" />
      </button>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
      {query ? (
        <button type="button" aria-label="Clear search" onClick={clear} className="text-muted-foreground transition-colors hover:text-primary">
          <X className="size-4" />
        </button>
      ) : null}
    </form>
  );
}

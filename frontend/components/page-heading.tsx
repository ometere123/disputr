import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {eyebrow ? <div className="mb-4">{eyebrow}</div> : null}
        <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-normal text-primary md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-xl leading-8 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0 pt-2">{action}</div> : null}
    </div>
  );
}

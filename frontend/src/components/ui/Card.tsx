"use client";

import { clsx } from "clsx";
import { ReactNode } from "react";

type CardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-zinc-200 bg-white shadow-sm ring-1 ring-transparent transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={clsx("space-y-1.5 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800", className)}>{children}</div>;
}

export function CardTitle({ className, children }: CardProps) {
  return <h3 className={clsx("text-lg font-semibold text-zinc-900 dark:text-zinc-100", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: CardProps) {
  return <p className={clsx("text-sm text-zinc-500 dark:text-zinc-400", className)}>{children}</p>;
}

export function CardContent({ className, children }: CardProps) {
  return <div className={clsx("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps) {
  return <div className={clsx("px-6 py-4 border-t border-zinc-200 dark:border-zinc-800", className)}>{children}</div>;
}



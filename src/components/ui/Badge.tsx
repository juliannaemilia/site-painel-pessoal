import type { HTMLAttributes } from "react";
import { cn, categoryToneFor } from "@/lib/utils";

export type BadgeTone = "neutral" | "indigo" | "violet" | "amber" | "green" | "rose";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  indigo: "bg-primary/10 text-primary",
  violet: "bg-accent/10 text-accent",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-success/10 text-success",
  rose: "bg-destructive/10 text-destructive",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

/**
 * Badge de categoria personalizada. Como o usuário pode criar qualquer nome de
 * categoria, a cor é derivada de um hash estável do próprio nome (mesma
 * categoria = sempre a mesma cor), em vez de um mapeamento fixo.
 */
export function CategoryBadge({ category }: { category: string }): JSX.Element {
  return <Badge tone={categoryToneFor(category)}>{category}</Badge>;
}

export function VisibilityBadge({ isPublic }: { isPublic: boolean }): JSX.Element {
  return <Badge tone={isPublic ? "green" : "neutral"}>{isPublic ? "Público" : "Privado"}</Badge>;
}

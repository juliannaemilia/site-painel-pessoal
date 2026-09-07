import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScrollToTopButtonProps {
  /** Distância de rolagem (px) a partir da qual o botão aparece. */
  threshold?: number;
  className?: string;
}

/**
 * Botão flutuante "voltar ao topo", que aparece após rolar a página além de
 * `threshold` pixels e some quando perto do topo novamente.
 */
export function ScrollToTopButton({ threshold = 400, className }: ScrollToTopButtonProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll(): void {
      setIsVisible(window.scrollY > threshold);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  function handleClick(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Voltar ao topo"
      className={cn(
        "fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg transition-all duration-200",
        "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        className
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

import { useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface StarfieldBackgroundProps {
  /** Quantidade de estrelas cintilantes. */
  starCount?: number;
  /** Quantidade de satélites cruzando o céu ao mesmo tempo. */
  satelliteCount?: number;
  /** Cor das estrelas (qualquer valor CSS válido: hex, rgb, var(--...), etc.). */
  starColor?: string;
  /** Cor do satélite/trilha. */
  satelliteColor?: string;
  /** [mín, máx] do tamanho das estrelas, em pixels. */
  starSizeRange?: [number, number];
  /** [mín, máx] da duração do ciclo de cintilação de cada estrela, em segundos. */
  twinkleDurationRange?: [number, number];
  /** [mín, máx] do tempo que um satélite leva para atravessar a tela, em segundos. */
  satelliteDurationRange?: [number, number];
  /** Comprimento da trilha do satélite, em pixels. */
  trailLength?: number;
  /** Classes extras no container — troque aqui o gradiente do céu, por exemplo. */
  className?: string;
}

interface StarConfig {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  twinkleMin: number;
}

interface SatelliteConfig {
  id: number;
  top: string;
  left: string;
  angleDeg: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Gera as estrelas com posição, tamanho e ritmo de cintilação aleatórios. */
function generateStars(
  count: number,
  sizeRange: [number, number],
  durationRange: [number, number]
): StarConfig[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    top: `${randomBetween(0, 100)}%`,
    left: `${randomBetween(0, 100)}%`,
    size: randomBetween(sizeRange[0], sizeRange[1]),
    duration: randomBetween(durationRange[0], durationRange[1]),
    delay: randomBetween(0, 5),
    twinkleMin: randomBetween(0.15, 0.4),
  }));
}

/**
 * Gera os satélites: cada um entra por uma borda aleatória da tela (topo,
 * direita, baixo ou esquerda) e atravessa até a borda oposta, com um pequeno
 * desvio lateral ("drift") para não parecer uma trajetória perfeitamente reta.
 */
function generateSatellites(count: number, durationRange: [number, number]): SatelliteConfig[] {
  const travel = 150;
  const angles = [-75, -62, -48, -35, -22, -10, 8, 20, 33, 47, 61, 74];
  const usedZones: number[] = [];

  return Array.from({ length: count }, (_, id) => {
    // Evita concentrar vários satélites na mesma faixa da tela.
    let zone = Math.floor(randomBetween(0, 12));
    let attempts = 0;
    while (usedZones.some((z) => Math.abs(z - zone) <= 1) && attempts < 12) {
      zone = Math.floor(randomBetween(0, 12));
      attempts++;
    }
    usedZones.push(zone);

    const angleDeg = angles[Math.floor(randomBetween(0, angles.length))] ?? 0;
    const radians = (angleDeg * Math.PI) / 180;

    // Cada satélite recebe uma posição inicial independente e uma trajetória
    // diagonal diferente. Pequenas variações impedem trajetórias idênticas.
    const side = Math.floor(randomBetween(0, 4));
    const spread = randomBetween(15, 85);
    let top: number;
    let left: number;
    let dx: number;
    let dy: number;

    if (side === 0) {
      top = -12;
      left = spread;
      dx = travel * Math.cos(radians);
      dy = Math.abs(travel * Math.sin(radians));
    } else if (side === 1) {
      top = spread;
      left = 112;
      dx = -Math.abs(travel * Math.cos(radians));
      dy = travel * Math.sin(radians);
    } else if (side === 2) {
      top = 112;
      left = spread;
      dx = travel * Math.cos(radians);
      dy = -Math.abs(travel * Math.sin(radians));
    } else {
      top = spread;
      left = -12;
      dx = Math.abs(travel * Math.cos(radians));
      dy = travel * Math.sin(radians);
    }

    // Um pequeno deslocamento único por satélite deixa o percurso menos previsível.
    dx += randomBetween(-12, 12);
    dy += randomBetween(-12, 12);

    return {
      id,
      top: `${top}%`,
      left: `${left}%`,
      angleDeg: (Math.atan2(dy, dx) * 180) / Math.PI,
      dx,
      dy,
      duration: randomBetween(durationRange[0], durationRange[1]),
      delay: randomBetween(-10, 0),
    };
  });
}

/**
 * Fundo decorativo "céu estrelado com trilha de satélite" — 100% CSS
 * (transform + opacity, sem canvas/SVG pesado, sem dependências externas).
 *
 * Customização rápida: mude as props abaixo (cores, quantidade, velocidade,
 * tamanho) ou os valores padrão dos parâmetros desta função para ajustar a
 * "personalidade" da animação em um só lugar. Os keyframes usados
 * (`star-twinkle` e `satellite-move`) estão em `src/index.css`.
 */
export function StarfieldBackground({
  starCount = 120,
  satelliteCount = 6,
  starColor = "#e2e8f0",
  satelliteColor = "#a5b4fc",
  starSizeRange = [1, 2.5],
  twinkleDurationRange = [2, 5],
  satelliteDurationRange = [8, 10],
  trailLength = 140,
  className,
}: StarfieldBackgroundProps): JSX.Element {
  const stars = useMemo(
    () => generateStars(starCount, starSizeRange, twinkleDurationRange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [starCount]
  );

  const satellites = useMemo(
    () => generateSatellites(satelliteCount, satelliteDurationRange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [satelliteCount, satelliteDurationRange]
  );

  return (
    <div
      aria-hidden="true"
      className={cn(
        "starfield-background pointer-events-none fixed inset-0 z-0 overflow-hidden",
        "bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900",
        className
      )}
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full"
          style={
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              backgroundColor: starColor,
              animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              "--twinkle-min": String(star.twinkleMin),
            } as CSSProperties
          }
        />
      ))}

      {satellites.map((sat) => (
        <span
          key={sat.id}
          className="absolute"
          style={
            {
              top: sat.top,
              left: sat.left,
              animation: `satellite-move ${sat.duration}s linear ${sat.delay}s infinite`,
              "--sat-dx": `${sat.dx}vw`,
              "--sat-dy": `${sat.dy}vh`,
            } as CSSProperties
          }
        >
          <span
            className="block rounded-full"
            style={{
              width: trailLength,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${satelliteColor})`,
              boxShadow: `0 0 6px 1px ${satelliteColor}`,
              transform: `rotate(${sat.angleDeg}deg)`,
              transformOrigin: "left center",
            }}
          />
        </span>
      ))}
    </div>
  );
}

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 22, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    ...props,
  } as SVGProps<SVGSVGElement>;
}

/* -------------------------------------------------------------------------- *
 * Punktarten / Aktionen                                                       *
 * -------------------------------------------------------------------------- */

/** Baseballschläger – für "Geschlagen" und "Weitschlag". */
export function BatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19.7 3.5a2 2 0 0 1 0 2.8L8.8 17.2l-2.8-2.8L16.9 3.5a2 2 0 0 1 2.8 0z" fill="currentColor" stroke="none" />
      <line x1="6.5" y1="14.7" x2="3.5" y2="17.7" />
      <line x1="9.3" y1="17.5" x2="6.3" y2="20.5" />
      <circle cx="4" cy="20" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Laufende Person – für "Laufpunkt". */
export function RunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="15.5" cy="4.5" r="2" fill="currentColor" stroke="none" />
      <path d="M9.5 21l2.5-5.5 -2-2 1.5-4 3.5 3 3 .5" />
      <path d="M6 11l3-1.5 3 .5" />
      <path d="M16 21l-1.5-4" />
    </svg>
  );
}

/** Aufnahme-Hand – für "Fangpunkt". */
export function HandIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M11 12V4a1.5 1.5 0 0 1 3 0v8" />
      <path d="M14 12V5.5a1.5 1.5 0 0 1 3 0V13" />
      <path d="M17 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.5-3.6L5.2 13a1.6 1.6 0 0 1 2.9-1.3L9 13" />
    </svg>
  );
}

/** Baseball – für "Abwurfpunkt". */
export function BallIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" fill="currentColor" stroke="currentColor" />
      <path
        d="M7 6.5c2 1.5 4.5 2 7 1.5M7 17.5c2-1.5 4.5-2 7-1.5"
        stroke="#ffffff"
        strokeWidth="1.4"
      />
      <path
        d="M6 6.5l-1 2 1 .5M6 17.5l-1-2 1-.5M18 6.5l1 2-1 .5M18 17.5l1-2-1-.5"
        stroke="#ffffff"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- *
 * Rollen                                                                      *
 * -------------------------------------------------------------------------- */

/** Stilisierter Pfeil/Speer – für "Angriff". */
export function AttackIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20L20 4" />
      <path d="M14 4h6v6" />
      <path d="M9 14l1 4-4-1" />
    </svg>
  );
}

/** Schild – für "Verteidigung". */
export function DefenseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2L4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- *
 * Steuerung                                                                   *
 * -------------------------------------------------------------------------- */

/** Pfeil zurück (Bogen mit Pfeilspitze) – für "Undo". */
export function UndoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 1 0 3-7L3 9" />
    </svg>
  );
}

/** Stift – für "Bearbeiten". */
export function EditIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/** Quadrat – für "Spiel beenden". */
export function StopIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Uhr mit Pfeil – für "Verlauf". */
export function HistoryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/** Dreieck nach rechts – für "Start". */
export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4l13 8-13 8V4z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Zwei Balken – für "Pause". */
export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** X – für "Schließen". */
export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- *
 * Helfer für die Punktarten-Anzeige                                           *
 * -------------------------------------------------------------------------- */

import type { PointTypeId } from '../types';

/**
 * Liefert das passende Icon zu einer Punktart. Für "Geschlagen" (keine
 * Punktart) gibt es einen eigenen Aufruf.
 */
export function PointIcon({
  id,
  ...props
}: IconProps & { id: PointTypeId }) {
  switch (id) {
    case 'laufpunkt':
      return <RunIcon {...props} />;
    case 'weitschlagpunkt':
      return <BatIcon {...props} />;
    case 'fangpunkt':
      return <HandIcon {...props} />;
    case 'abwurfpunkt':
      return <BallIcon {...props} />;
  }
}

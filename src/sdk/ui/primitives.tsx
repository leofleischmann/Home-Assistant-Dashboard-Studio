/** Generic card container — the basic building block. */
export function Card({
  children,
  style,
  onClick,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div className="rd-card" style={style} onClick={onClick}>
      {children}
    </div>
  );
}

/** Section wrapper with a title. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rd-section">
      <h2 className="rd-section__title">{title}</h2>
      {children}
    </section>
  );
}

export type StatProps = {
  label: string;
  value: string;
  unit?: string;
  /** Full-card accent background (default false). */
  accent?: boolean;
  /** Value text color, or card background when `accent` is true. */
  color?: string;
  /** Secondary hint below the value (e.g. trend context). */
  sub?: string;
};

/** A small labelled stat tile. */
export function Stat({ label, value, unit, accent, color, sub }: StatProps) {
  const cardStyle =
    accent && color
      ? ({ background: color, borderColor: color } as React.CSSProperties)
      : undefined;
  const valueStyle = !accent && color ? ({ color } as React.CSSProperties) : undefined;

  return (
    <div className={`rd-card rd-stat ${accent ? 'is-accent' : ''}`} style={cardStyle}>
      <span className="rd-stat__label">{label}</span>
      <span className="rd-stat__value" style={valueStyle}>
        {value}
        {unit && <small> {unit}</small>}
      </span>
      {sub && <span className="rd-stat__sub">{sub}</span>}
    </div>
  );
}

/** Responsive grid — `min` sets the minimum column width in px. */
export function Grid({
  children,
  min = 180,
}: {
  children: React.ReactNode;
  min?: number;
}) {
  return (
    <div className="rd-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` }}>
      {children}
    </div>
  );
}

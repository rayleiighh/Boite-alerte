export function Card({ className="", ...props }) {
  return (
    <div
      className={`bg-white border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] ${className}`}
      {...props}
    />
  );
}

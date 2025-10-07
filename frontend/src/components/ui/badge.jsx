export function Badge({ className="", children }) {
  return <span className={`px-2.5 py-1 text-xs text-white rounded-full ${className}`}>{children}</span>;
}

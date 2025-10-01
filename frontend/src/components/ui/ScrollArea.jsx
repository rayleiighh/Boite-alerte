export function ScrollArea({ className = "", ...props }) {
  return (
    <div className={`w-full overflow-y-auto overflow-x-hidden ${className}`} {...props} />
  );
}

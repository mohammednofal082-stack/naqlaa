export function IndustryBadge({
  industry,
  className: _className,
}: {
  industry: string;
  className?: string;
}) {
  return <span className="text-xs text-text-muted">{industry}</span>;
}

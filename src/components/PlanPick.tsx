'use client';

export function PlanPick({ slug, label, className }: { slug: string; label: string; className?: string }) {
  return (
    <a
      href="#order"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent('pickplan', { detail: slug }))}
    >
      {label}
    </a>
  );
}

import { CheckCircle } from 'lucide-react';

interface QualificationBadgeProps {
  isQualified: boolean;
  method?: string | null;
}

export default function QualificationBadge({ isQualified, method }: QualificationBadgeProps) {
  if (!isQualified) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: '#dcfce7', color: 'var(--color-success)' }}
      title={method || 'Qualified'}
    >
      <CheckCircle className="w-3 h-3" />
      Qualified
    </span>
  );
}

import { cn } from '@/lib/utils';

interface PriceLevelProps {
  level: number; // 1–4
  className?: string;
}

const LABELS: Record<number, string> = {
  1: 'Budget',
  2: 'Moderate',
  3: 'Pricey',
  4: 'Premium',
};

export function PriceLevel({ level, className }: PriceLevelProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      title={LABELS[level] ?? 'Unknown'}
      aria-label={`Price level: ${LABELS[level] ?? level} out of 4`}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'text-sm font-medium',
            i < level ? 'text-gray-800' : 'text-gray-300',
          )}
        >
          ₦
        </span>
      ))}
    </span>
  );
}

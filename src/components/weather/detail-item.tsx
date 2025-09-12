
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';

interface DetailItemProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  value: string | number | ReactNode;
}

export function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex flex-row items-center justify-center gap-2 p-2 bg-black/10 rounded-lg text-center">
      <Icon className="w-6 h-6 text-foreground/80 flex-shrink-0" />
      <div className="flex flex-col text-left">
        <div className="font-bold text-sm">{value}</div>
        <p className="text-xs text-foreground/60">{label}</p>
      </div>
    </div>
  );
}

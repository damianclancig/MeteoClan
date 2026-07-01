/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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

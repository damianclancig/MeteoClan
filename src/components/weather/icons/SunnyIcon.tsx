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

import { AstroHero } from './AstroHero';
import { isDayTime } from '@/utils/weather-utils';

interface SunnyIconProps {
  className?: string;
  iconCode?: string;
}

/**
 * SunnyIcon - v2.00 (Dynamic Clear Sky)
 * Visualización dinámica del Sol o la Luna para cielos despejados (800).
 */
export const SunnyIcon: React.FC<SunnyIconProps> = ({ 
  className = "w-24 h-24 md:w-32 md:h-32",
  iconCode 
}) => {
  const isDay = isDayTime(iconCode);
  
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 ease-in-out`}>
      <AstroHero 
        isDay={isDay} 
        className="w-full h-full" 
      />
    </div>
  );
};

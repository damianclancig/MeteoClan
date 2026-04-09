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

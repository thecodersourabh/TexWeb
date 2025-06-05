import { useEffect, useRef } from 'react';

interface RangeInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label?: string;
  unit?: string;
  showValue?: boolean;
}

export function RangeInput({ 
  value, 
  onChange, 
  min, 
  max, 
  step,
  label,
  unit = "",
  showValue = true 
}: RangeInputProps) {
  const rangeRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateRangeFill();
  }, [value, min, max]);

  const updateRangeFill = () => {
    if (rangeRef.current && trackRef.current) {
      const percentage = ((value - min) / (max - min)) * 100;
      trackRef.current.style.width = `${percentage}%`;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMove = (e: MouseEvent) => {
      if (rangeRef.current) {
        const rect = rangeRef.current.getBoundingClientRect();
        const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        const newValue = min + (max - min) * percentage;
        const steppedValue = Math.round(newValue / step) * step;
        onChange(Math.min(Math.max(steppedValue, min), max));
      }
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>{label}</span>
          {showValue && (
            <span className="tabular-nums">
              {value.toFixed(1)}{unit}
            </span>
          )}
        </div>
      )}
      <div 
        className="range-container relative h-6 flex items-center cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 h-1 bg-gray-200 rounded-full">
          <div
            ref={trackRef}
            className="absolute h-full bg-rose-600 rounded-full"
          />
        </div>
        <input
          ref={rangeRef}
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-rose-600 rounded-full shadow transform -translate-x-1/2"
          style={{
            left: `${((value - min) / (max - min)) * 100}%`,
            transition: 'transform 0.1s ease',
          }}
        />
      </div>
    </div>
  );
}

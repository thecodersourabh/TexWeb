import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface RangeInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label?: string;
  unit?: string;
  showValue?: boolean;
  debounceMs?: number;
}

export const RangeInput = memo(function RangeInput({ 
  value, 
  onChange, 
  min, 
  max, 
  step,
  label,
  unit = "",
  showValue = true,
  debounceMs = 150
}: RangeInputProps) {
  const rangeRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const lastUpdateRef = useRef(value);

  // Sync local value with prop value when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
      lastUpdateRef.current = value;
    }
  }, [value, isDragging]);

  const debouncedOnChange = useDebounce(onChange, debounceMs);

  const updateRangeFill = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      if (trackRef.current) {
        const percentage = ((localValue - min) / (max - min)) * 100;
        trackRef.current.style.width = `${percentage}%`;
      }
    });
  }, [localValue, min, max]);

  useEffect(() => {
    updateRangeFill();
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateRangeFill]);

  const updateValue = useCallback((newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    setLocalValue(clampedValue);
    
    // Always send updates while dragging to maintain responsive UI
    if (isDragging) {
      debouncedOnChange(clampedValue);
      lastUpdateRef.current = clampedValue;
    } else {
      // Immediate update when not dragging
      onChange(clampedValue);
    }
  }, [min, max, isDragging, onChange, debouncedOnChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Ensure the final value is sent without debouncing
    if (lastUpdateRef.current !== localValue) {
      onChange(localValue);
    }
  }, [localValue, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMove = (e: MouseEvent) => {
      if (rangeRef.current) {
        const rect = rangeRef.current.getBoundingClientRect();
        const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        const newValue = min + (max - min) * percentage;
        const steppedValue = Math.round(newValue / step) * step;
        updateValue(steppedValue);
      }
    };

    const handleUp = () => {
      handleDragEnd();
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseup', handleUp);
  }, [min, max, step, updateValue, handleDragEnd]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleTouchMove = (e: TouchEvent) => {
      if (rangeRef.current && e.touches[0]) {
        const rect = rangeRef.current.getBoundingClientRect();
        const percentage = Math.min(Math.max((e.touches[0].clientX - rect.left) / rect.width, 0), 1);
        const newValue = min + (max - min) * percentage;
        const steppedValue = Math.round(newValue / step) * step;
        updateValue(steppedValue);
      }
    };

    const handleTouchEnd = () => {
      handleDragEnd();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [min, max, step, updateValue, handleDragEnd]);

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>{label}</span>
          {showValue && (
            <span className="tabular-nums font-medium">
              {localValue.toFixed(1)}{unit}
            </span>
          )}
        </div>
      )}
      <div 
        className="range-container relative h-6 flex items-center cursor-pointer touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute inset-0 h-1 bg-gray-200 rounded-full">
          <div
            ref={trackRef}
            className="absolute h-full bg-rose-600 rounded-full"
            style={{ willChange: 'width' }}
          />
        </div>
        <input
          ref={rangeRef}
          type="range"
          value={localValue}
          onChange={(e) => updateValue(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="absolute w-full h-full opacity-0 cursor-pointer touch-none"
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-rose-600 rounded-full shadow transform -translate-x-1/2 hover:scale-110 active:scale-95 transition-transform"
          style={{
            left: `${((localValue - min) / (max - min)) * 100}%`,
            willChange: 'transform',
            transform: `translateX(-50%) ${isDragging ? 'scale(1.1)' : ''}`,
            transition: isDragging ? 'none' : 'all 0.1s ease',
          }}
        />
      </div>
    </div>
  );
});

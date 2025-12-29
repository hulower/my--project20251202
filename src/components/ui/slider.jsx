import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Slider - 滑块组件
 * 基于原生 HTML input[type="range"] 实现
 */
const Slider = React.forwardRef(({ 
  className, 
  value = [0], 
  max = 100, 
  min = 0,
  step = 1, 
  onValueChange,
  disabled = false,
  ...props 
}, ref) => {
  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange([parseFloat(e.target.value)]);
    }
  };

  return (
    <div className={cn("relative flex items-center w-full h-6 group", className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || 0}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer",
          "dark:bg-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Webkit (Chrome, Safari) - 默认隐藏，hover 时显示
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:w-3",
          "[&::-webkit-slider-thumb]:h-3",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-primary",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-webkit-slider-thumb]:shadow-md",
          "[&::-webkit-slider-thumb]:shadow-primary/30",
          "[&::-webkit-slider-thumb]:transition-all",
          "[&::-webkit-slider-thumb]:opacity-0",
          "[&::-webkit-slider-thumb]:scale-0",
          "group-hover:[&::-webkit-slider-thumb]:opacity-100",
          "group-hover:[&::-webkit-slider-thumb]:scale-100",
          "[&::-webkit-slider-thumb]:hover:scale-110",
          "[&::-webkit-slider-thumb]:hover:shadow-lg",
          "[&::-webkit-slider-thumb]:active:scale-125",
          "[&::-webkit-slider-thumb]:active:opacity-100",
          "[&::-webkit-slider-thumb]:relative",
          "[&::-webkit-slider-thumb]:-mt-1", // 垂直居中修正
          // Firefox - 默认隐藏，hover 时显示
          "[&::-moz-range-thumb]:w-3",
          "[&::-moz-range-thumb]:h-3",
          "[&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-primary",
          "[&::-moz-range-thumb]:border-0",
          "[&::-moz-range-thumb]:cursor-pointer",
          "[&::-moz-range-thumb]:shadow-md",
          "[&::-moz-range-thumb]:shadow-primary/30",
          "[&::-moz-range-thumb]:transition-all",
          "[&::-moz-range-thumb]:opacity-0",
          "[&::-moz-range-thumb]:scale-0",
          "group-hover:[&::-moz-range-thumb]:opacity-100",
          "group-hover:[&::-moz-range-thumb]:scale-100",
          "[&::-moz-range-thumb]:hover:scale-110",
          "[&::-moz-range-thumb]:hover:shadow-lg",
          "[&::-moz-range-thumb]:active:scale-125",
          "[&::-moz-range-thumb]:active:opacity-100",
          // Track
          "[&::-webkit-slider-runnable-track]:h-1",
          "[&::-webkit-slider-runnable-track]:rounded-lg",
          "[&::-webkit-slider-runnable-track]:bg-transparent",
          "[&::-moz-range-track]:h-1",
          "[&::-moz-range-track]:rounded-lg",
          "[&::-moz-range-track]:bg-transparent"
        )}
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((value[0] - min) / (max - min)) * 100}%, rgb(229, 231, 235) ${((value[0] - min) / (max - min)) * 100}%, rgb(229, 231, 235) 100%)`
        }}
        {...props}
      />
    </div>
  );
});

Slider.displayName = 'Slider';

export { Slider };


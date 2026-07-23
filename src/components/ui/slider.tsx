"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utilities/cn";

export interface SliderProps extends React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> {
  /** Accessible name for the thumb. */
  label: string;
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      "data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-pill bg-timeline-track">
      <SliderPrimitive.Range className="absolute h-full rounded-pill bg-accent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label={label}
      className={cn(
        "block h-4 w-4 rounded-pill bg-primary shadow-tooltip",
        "border-2 border-accent",
        "transition-transform duration-hover ease-standard hover:scale-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

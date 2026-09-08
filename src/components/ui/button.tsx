import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 transition-[scale,background-color,color,opacity] duration-150 ease-out active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        solid:
          "bg-fg text-bg hover:bg-fg/90",
        ghost:
          "bg-transparent text-fg hover:bg-fg/8",
        outline:
          "bg-transparent text-fg shadow-[0_0_0_1px_rgba(236,236,232,0.14)] hover:bg-fg/6",
        accent:
          "bg-accent text-bg hover:bg-accent/90",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-sm",
        md: "h-10 rounded-lg px-4 text-sm",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

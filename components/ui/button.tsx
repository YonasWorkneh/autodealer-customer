import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover hover:shadow-[0_4px_14px_rgba(82,32,132,0.35)] active:scale-[0.98] focus-visible:border-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-destructive/60",
        outline:
          "border border-primary/40 bg-background text-foreground shadow-xs hover:bg-primary/10 hover:border-primary/60 hover:text-primary focus-visible:ring-primary/25 focus-visible:border-primary/60 dark:bg-input/30 dark:border-primary/30 dark:hover:bg-primary/15",
        secondary:
          "bg-primary/10 text-foreground shadow-xs hover:bg-primary/15 border border-primary/20 focus-visible:ring-primary/25 focus-visible:border-primary/30",
        ghost:
          "text-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/25 focus-visible:bg-primary/5 dark:hover:bg-primary/15",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover focus-visible:ring-primary/25 focus-visible:rounded-sm",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

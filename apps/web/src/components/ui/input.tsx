import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

const fieldClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 transition-colors";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClass, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClass, "resize-none", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldClass, className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

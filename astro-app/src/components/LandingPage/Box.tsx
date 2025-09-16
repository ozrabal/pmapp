import { cx } from "class-variance-authority";

export default function Box({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "backdrop-blur-sm w-full md:px-7 bg-slate-950/75 border rounded-2xl border-slate-900 py-6 px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

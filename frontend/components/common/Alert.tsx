export function Alert({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "error";
}) {
  const border = variant === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-neutral-200 bg-neutral-50 text-neutral-800";
  return <div className={`rounded-md border px-3 py-2 text-sm ${border}`}>{children}</div>;
}

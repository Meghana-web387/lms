import { AuthGuard } from "@/components/Auth/AuthGuard";
import { SubjectShell } from "@/components/Layout/SubjectShell";

export default function SubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subjectId: string };
}) {
  return (
    <AuthGuard>
      <SubjectShell subjectId={params.subjectId}>{children}</SubjectShell>
    </AuthGuard>
  );
}

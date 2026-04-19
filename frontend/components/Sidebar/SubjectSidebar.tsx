import { SectionItem } from "./SectionItem";
import type { SubjectTree } from "@/store/sidebarStore";

export function SubjectSidebar({
  tree,
  subjectId,
  currentVideoId,
}: {
  tree: SubjectTree;
  subjectId: string;
  currentVideoId?: string;
}) {
  return (
    <aside className="w-full shrink-0 border-b border-neutral-200 pb-6 md:w-64 md:border-b-0 md:border-r md:pr-6 md:pb-0">
      <h2 className="mb-4 text-sm font-semibold text-neutral-900">{tree.title}</h2>
      <nav className="space-y-6">
        {tree.sections.map((s) => (
          <SectionItem
            key={s.id}
            section={s}
            subjectId={subjectId}
            currentVideoId={currentVideoId}
          />
        ))}
      </nav>
    </aside>
  );
}

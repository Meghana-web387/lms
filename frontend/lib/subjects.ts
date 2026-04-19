import { apiClient } from "./apiClient";
import type { SubjectTree } from "@/store/sidebarStore";

export async function fetchSubjectTree(subjectId: string): Promise<SubjectTree> {
  const { data } = await apiClient.get<SubjectTree>(`/subjects/${subjectId}/tree`);
  return data;
}

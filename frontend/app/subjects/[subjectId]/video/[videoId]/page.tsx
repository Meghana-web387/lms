import { VideoLesson } from "@/components/Video/VideoLesson";

export default function VideoPage({
  params,
}: {
  params: { subjectId: string; videoId: string };
}) {
  return <VideoLesson subjectId={params.subjectId} videoId={params.videoId} />;
}

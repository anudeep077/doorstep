import type { Metadata } from "next";
import { TrackView } from "@/components/track-view";

export const metadata: Metadata = { title: "Track order — Doorstep" };

export default async function TrackPage(props: PageProps<"/track/[id]">) {
  const { id } = await props.params;
  return <TrackView id={id} />;
}

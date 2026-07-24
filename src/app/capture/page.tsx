import { redirect } from "next/navigation";
import { captureStage } from "@/lib/global/shared/routes";

export default function CaptureIndexPage() {
  redirect(captureStage("readiness"));
}

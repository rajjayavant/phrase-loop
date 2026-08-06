import { guideOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/features/guides/og-image";

export const alt = "How to Loop a Section of a YouTube Video";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return guideOgImage("How to loop a section of a YouTube video");
}

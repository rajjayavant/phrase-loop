import { guideOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/features/guides/og-image";

export const alt = "Does Slowing Down a Video Change the Pitch?";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return guideOgImage("Does slowing down a video change the pitch?");
}

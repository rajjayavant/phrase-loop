import { guideOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/features/guides/og-image";

export const alt = "How to Practice a Difficult Passage | Fix the Bar That Keeps Failing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return guideOgImage("How to practice a difficult passage");
}

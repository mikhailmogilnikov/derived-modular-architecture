import { llms } from "fumadocs-core/source";
import { source } from "@/services/docs-content/public/source";

export const revalidate = false;

export function GET() {
  return new Response(llms(source).index());
}

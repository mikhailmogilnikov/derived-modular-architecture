import { createTokenizer } from "@orama/tokenizers/mandarin";
import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/services/docs-content/public/source";

export const { GET } = createFromSource(source, {
  localeMap: {
    en: { language: "english" },
    ru: { language: "russian" },
    zh: {
      components: { tokenizer: createTokenizer() },
      search: { threshold: 0, tolerance: 0 },
    },
  },
});

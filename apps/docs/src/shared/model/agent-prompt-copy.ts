export const agentPromptCopy = {
  en: {
    label: "Agent prompt",
    tooltip:
      "Copied. Paste into your agent chat in your project (Cursor, Claude Code, Codex). The prompt will suggest where to start with DMA.",
  },
  ru: {
    label: "Промпт для агента",
    tooltip:
      "Скопировано. Вставьте в чат агента в своём проекте (Cursor, Claude Code, Codex). Промпт подскажет, с чего начать применять DMA.",
  },
} as const;

export type AgentPromptLocale = keyof typeof agentPromptCopy;

export function getAgentPromptCopy(lang: string) {
  return lang === "ru" ? agentPromptCopy.ru : agentPromptCopy.en;
}

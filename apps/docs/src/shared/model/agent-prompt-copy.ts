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
  zh: {
    label: "智能体提示词",
    tooltip:
      "已复制。粘贴到你项目里的智能体对话（Cursor、Claude Code、Codex）。该提示词会建议如何开始应用 DMA。",
  },
} as const;

export type AgentPromptLocale = keyof typeof agentPromptCopy;

export function getAgentPromptCopy(lang: string) {
  return agentPromptCopy[lang as AgentPromptLocale] ?? agentPromptCopy.en;
}

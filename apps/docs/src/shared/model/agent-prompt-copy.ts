export const agentPromptCopy = {
  en: {
    label: "Agent prompt",
    tooltip:
      "Copied! Paste into your agent project chat (Claude Code, Codex, Cursor, etc.). It'll suggest next steps for integrating the architecture into your project.",
  },
  ru: {
    label: "Промпт для агента",
    tooltip:
      "Скопировано! Вставьте в чат проекта Вашего агента (Claude Code, Codex, Cursor и т.д.). Он предложит дальнейшие шаги по интеграции архитектуры в проект.",
  },
} as const;

export type AgentPromptLocale = keyof typeof agentPromptCopy;

export function getAgentPromptCopy(lang: string) {
  return lang === "ru" ? agentPromptCopy.ru : agentPromptCopy.en;
}

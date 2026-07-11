export const agentPromptCopy = {
  en: {
    label: "Agent prompt",
    tooltip:
      "Copied! Paste into your agent chat — it'll suggest next steps for integrating the architecture into your project.",
  },
  ru: {
    label: "Промпт для агента",
    tooltip:
      "Скопировано! Вставьте в чат агента — он предложит дальнейшие шаги по интеграции архитектуры в проект.",
  },
} as const;

export type AgentPromptLocale = keyof typeof agentPromptCopy;

export function getAgentPromptCopy(lang: string) {
  return lang === "ru" ? agentPromptCopy.ru : agentPromptCopy.en;
}

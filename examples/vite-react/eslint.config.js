import dma from "@derived-modular/eslint-plugin";

export default [
  { ignores: ["dist/**"] },
  ...dma.configs.recommended,
  {
    settings: {
      dma: { compositionRoots: ["app", "pages", "routes"], srcRoot: "src" },
    },
  },
];

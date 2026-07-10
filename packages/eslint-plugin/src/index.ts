import type { ESLint, Linter } from "eslint";
import { featureToFeature } from "./rules/feature-to-feature.js";
import { layerDirection } from "./rules/layer-direction.js";
import { noBarrel } from "./rules/no-barrel.js";
import { publicApi } from "./rules/public-api.js";

const plugin = {
  meta: {
    name: "@derived-modular/eslint-plugin",
    version: "1.0.0",
  },
  rules: {
    "feature-to-feature": featureToFeature,
    "layer-direction": layerDirection,
    "no-barrel": noBarrel,
    "public-api": publicApi,
  },
} satisfies ESLint.Plugin;

const recommendedRules: Linter.RulesRecord = {
  "@derived-modular/feature-to-feature": "error",
  "@derived-modular/layer-direction": "error",
  "@derived-modular/no-barrel": "error",
  "@derived-modular/public-api": "error",
};

const configs: { recommended: Linter.Config[] } = {
  recommended: [
    {
      plugins: {
        "@derived-modular": plugin,
      },
      rules: recommendedRules,
    },
  ],
};

Object.assign(plugin, { configs });

export default plugin;
export { configs };

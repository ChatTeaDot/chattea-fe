import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/react-native-web-vite",
    options: {
      pluginReactOptions: {
        babel: {
          plugins: [["react-native-unistyles/plugin", { root: "src" }]],
        },
      },
    },
  },
};

export default config;

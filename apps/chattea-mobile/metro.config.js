const { getDatadogExpoConfig } = require("@datadog/mobile-react-native/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const getDefaultConfig = (projectRoot, options) => {
  return getSentryExpoConfig(projectRoot, {
    ...options,
    getDefaultConfig: undefined,
  });
};

const { withStorybook } = require("@storybook/react-native/metro/withStorybook");

module.exports = withStorybook(
  getDatadogExpoConfig(__dirname, {
    getDefaultConfig,
  }),
  {
    enabled: process.env.EXPO_PUBLIC_STORYBOOK === "true",
    configPath: "./.rnstorybook",
  },
);

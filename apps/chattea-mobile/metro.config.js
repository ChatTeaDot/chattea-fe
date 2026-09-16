const { getDatadogExpoConfig } = require("@datadog/mobile-react-native/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const getDefaultConfig = (projectRoot, options) => {
  return getSentryExpoConfig(projectRoot, {
    ...options,
    getDefaultConfig: undefined,
  });
};

module.exports = getDatadogExpoConfig(__dirname, {
  getDefaultConfig,
});

const { getDefaultConfig } = require("expo/metro-config");
const { withDatadogMetroConfig } = require("@datadog/mobile-react-native/metro");
const { withSentryConfig } = require("@sentry/react-native/metro");

const config = getDefaultConfig(__dirname);

module.exports = withDatadogMetroConfig(withSentryConfig(config));

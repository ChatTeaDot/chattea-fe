import "@chattea/design-system/theme";
import "./src/i18n";

if (process.env.EXPO_PUBLIC_STORYBOOK === "true") {
  const { registerRootComponent } = require("expo");
  registerRootComponent(require("./.rnstorybook").default);
} else {
  require("expo-router/entry");
}

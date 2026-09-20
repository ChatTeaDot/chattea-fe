import type { Preview } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";

import { colors } from "../src/theme";

const preview: Preview = {
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: colors.background },
        { name: "dark", value: "#16171b" },
      ],
    },
  },
};

export default preview;

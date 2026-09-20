import type { Meta, StoryObj } from "@storybook/react-native";

import MetaText from "./meta-text";

const meta = {
  component: MetaText,
  args: {
    children: "3분 전 · 서울",
  },
} satisfies Meta<typeof MetaText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

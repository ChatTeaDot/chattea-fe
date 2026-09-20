import type { Meta, StoryObj } from "@storybook/react-native";
import { Text } from "react-native";

import SectionHeading from "./section-heading";

const meta = {
  component: SectionHeading,
  args: {
    title: "지금 나누는 이야기",
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: { action: <Text>더보기</Text> },
};

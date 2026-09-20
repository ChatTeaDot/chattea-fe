import type { Meta, StoryObj } from "@storybook/react-native";
import { Text } from "react-native";
import { action } from "storybook/actions";

import ListRow from "./list-row";

const meta = {
  component: ListRow,
  args: {
    title: "알림 설정",
    onPress: action("onPress"),
  },
} satisfies Meta<typeof ListRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSide: Story = {
  args: { side: <Text>ON</Text> },
};

export const Last: Story = {
  args: { last: true },
};

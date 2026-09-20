import type { Meta, StoryObj } from "@storybook/react-native";
import { action } from "storybook/actions";

import ContentState from "./content-state";

const meta = {
  component: ContentState,
  argTypes: {
    kind: {
      control: { type: "select" },
      options: ["loading", "empty", "error"],
    },
  },
} satisfies Meta<typeof ContentState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { kind: "loading" },
};

export const Empty: Story = {
  args: { kind: "empty" },
};

export const Error: Story = {
  args: { kind: "error", onRetry: action("onRetry") },
};

export const CustomCopy: Story = {
  args: {
    kind: "empty",
    title: "아직 매칭이 없어요",
    message: "카드를 넘기면 새로운 인연이 보여요.",
  },
};

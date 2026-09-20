import type { Meta, StoryObj } from "@storybook/react-native";
import { action } from "storybook/actions";

import AppButton from "./app-button";

const meta = {
  component: AppButton,
  args: {
    title: "계속하기",
    onPress: action("onPress"),
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["filled", "outlined", "soft", "text"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof AppButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = {};

export const Outlined: Story = {
  args: { variant: "outlined" },
};

export const Soft: Story = {
  args: { variant: "soft" },
};

export const Text: Story = {
  args: { variant: "text" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

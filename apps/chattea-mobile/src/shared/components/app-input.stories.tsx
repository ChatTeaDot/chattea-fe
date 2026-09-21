import type { Meta, StoryObj } from "@storybook/react-native";

import AppInput from "./app-input";

const meta = {
  component: AppInput,
  args: {
    label: "닉네임",
    placeholder: "이름을 입력해 주세요",
  },
} satisfies Meta<typeof AppInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: "지은" },
};

export const Disabled: Story = {
  args: { editable: false },
};

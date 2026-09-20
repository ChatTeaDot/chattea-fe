import { TextInput, type TextInputProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

const NativeTextInput = ({ placeholderTextColor, ...props }: TextInputProps) => {
  const { theme } = useUnistyles();
  return <TextInput {...props} placeholderTextColor={placeholderTextColor ?? theme.colors.muted} />;
};

export default NativeTextInput;

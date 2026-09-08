import { Alert } from "react-native";

export const showActionError = () => {
  Alert.alert("처리하지 못했어요", "잠시 후 다시 시도해 주세요.");
};

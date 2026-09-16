import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MetaText } from "@/shared/components";

import type { FormLabelProps } from "../types";

const FormLabel = ({ label, hint }: FormLabelProps) => {
  return (
    <View style={styles.formLabel}>
      <Text style={styles.formLabelText}>{label}</Text>
      {hint ? <MetaText>{hint}</MetaText> : null}
    </View>
  );
};
const styles = StyleSheet.create((theme) => ({
  formLabel: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  formLabelText: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
}));
export default FormLabel;

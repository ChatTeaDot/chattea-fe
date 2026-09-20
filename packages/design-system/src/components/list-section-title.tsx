import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const ListSectionTitle = ({ title }: { title: string }) => {
  return <Text style={styles.sectionTitle}>{title}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  sectionTitle: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600",
    paddingBottom: theme.spacing.xs,
    paddingHorizontal: 20,
    paddingTop: theme.spacing.control,
  },
}));

export default ListSectionTitle;

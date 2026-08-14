import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

export type LikeTab = "received" | "sent";

type LikeTabsProps = {
  onChange: (value: LikeTab) => void;
  value: LikeTab;
};

const tabs: { key: LikeTab; label: string }[] = [
  { key: "received", label: "받은 좋아요" },
  { key: "sent", label: "보낸 좋아요" },
];

export const LikeTabs = ({ onChange, value }: LikeTabsProps) => {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          accessibilityRole="button"
          onPress={() => onChange(tab.key)}
          style={[styles.tab, value === tab.key && styles.activeTab]}
        >
          <Text style={[styles.tabText, value === tab.key && styles.activeTabText]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: colors.primary,
  },
  activeTabText: {
    color: colors.primaryText,
  },
  tab: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  tabs: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  tabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "900",
  },
});

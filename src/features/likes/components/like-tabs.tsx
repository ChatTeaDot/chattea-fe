import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

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
          accessibilityLabel={tab.label}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === tab.key }}
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

const styles = StyleSheet.create((theme: AppTheme) => ({
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  activeTabText: {
    color: theme.colors.primaryText,
  },
  tab: {
    alignItems: "center",
    borderRadius: theme.radii.pill,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
  },
  tabs: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  tabText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "900",
  },
}));

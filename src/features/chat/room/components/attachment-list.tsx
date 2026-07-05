import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

import { AttachmentDraft } from "../../types";

type AttachmentListProps = {
  attachments: AttachmentDraft[];
};

export const AttachmentList = ({ attachments }: AttachmentListProps) => {
  return attachments.map((attachment) => (
    <View key={attachment.id} style={styles.attachment}>
      <Text style={styles.text}>{attachment.filename}</Text>
      <Text style={styles.status}>{attachment.status}</Text>
    </View>
  ));
};

const styles = StyleSheet.create({
  attachment: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.sm,
  },
  text: {
    color: colors.text,
  },
  status: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});

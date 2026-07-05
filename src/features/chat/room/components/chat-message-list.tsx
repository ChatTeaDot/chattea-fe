import { RefObject } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { spacing } from "@/theme/tokens";

import { Message } from "../../types";
import { MessageBubble } from "./message-bubble";

type ChatMessageListProps = {
  messages: Message[];
  onContentSizeChange: () => void;
  onReportMessage: (messageId: string) => void;
  scrollRef: RefObject<ScrollView | null>;
};

export const ChatMessageList = ({
  messages,
  onContentSizeChange,
  onReportMessage,
  scrollRef,
}: ChatMessageListProps) => {
  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.list}
      onContentSizeChange={onContentSizeChange}
      style={styles.listFrame}
    >
      {messages.map((item) => (
        <MessageBubble key={item.id} message={item} onReport={() => onReportMessage(item.id)} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  listFrame: {
    flex: 1,
  },
});

import { useCallback } from "react";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ContentPhoto, MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { CandidateRowProps } from "../types";

const CandidateRow = ({
  age,
  disabled,
  id,
  intro,
  name,
  onInterest,
  photoUrl,
  region,
}: CandidateRowProps) => {
  const sendInterest = useCallback(() => onInterest(id), [id, onInterest]);
  return (
    <NativeCard>
      <ContentPhoto height={144} label={`${name}님의 사진`} recyclingKey={id} uri={photoUrl} />
      <Text style={styles.personName}>
        {name} {age}세
      </Text>
      <MetaText>{region}</MetaText>
      <Text style={styles.intro}>{intro}</Text>
      <NativeButton disabled={disabled} label="관심 보내기" onPress={sendInterest} fullWidth />
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  personName: { color: theme.colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  intro: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
}));
export default CandidateRow;

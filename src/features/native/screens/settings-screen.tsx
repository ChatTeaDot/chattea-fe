import { useMutation } from "@apollo/client/react";
import { router } from "expo-router";
import { Alert, Text } from "react-native";

import { useSession } from "@/providers/session-provider";

import { MetaText, NativeButton, NativeCard, NativeScreen, NativeScroll } from "../components";
import { REQUEST_ACCOUNT_DELETION_MUTATION } from "../operations";
import { formatDate, showActionError, styles } from "./screen-shared";

export const SettingsScreen = () => {
  const { setSession } = useSession();
  const [requestDeletion, state] = useMutation<{
    requestAccountDeletion: { hidden: boolean; scheduledFor: string };
  }>(REQUEST_ACCOUNT_DELETION_MUTATION);
  const deleteAccount = () => {
    Alert.alert(
      "정말 탈퇴할까요?",
      "지금 바로 계정이 숨겨지고 로그아웃돼요. 14일 안에 다시 로그인하면 복구할 수 있어요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () => {
            void requestDeletion()
              .then((response) => {
                const scheduledFor = response.data?.requestAccountDeletion.scheduledFor;
                setSession(null);
                router.replace("/");
                if (scheduledFor)
                  Alert.alert(
                    "탈퇴를 예약했어요",
                    `${formatDate(scheduledFor)}까지 다시 로그인하면 계정을 복구할 수 있어요.`,
                  );
              })
              .catch(showActionError);
          },
        },
      ],
    );
  };
  return (
    <NativeScreen>
      <NativeScroll>
        <NativeCard>
          <Text style={styles.postTitle}>알림 설정</Text>
          <MetaText>좋아요, 매치, 메시지, 댓글, 결제 소식을 앱 알림으로 받을 수 있어요.</MetaText>
          <NativeButton
            label="알림 확인하기"
            onPress={() => router.push("/notifications")}
            tone="secondary"
            fullWidth
          />
        </NativeCard>
        <NativeCard>
          <Text style={styles.postTitle}>로그아웃</Text>
          <MetaText>이 기기에서만 로그아웃해요.</MetaText>
          <NativeButton
            label="로그아웃"
            onPress={() => {
              setSession(null);
              router.replace("/");
            }}
            tone="secondary"
            fullWidth
          />
        </NativeCard>
        <NativeCard>
          <Text style={styles.postTitle}>회원 탈퇴</Text>
          <MetaText>
            탈퇴 후 14일 동안 계정을 복구할 수 있어요. 기간이 지나면 개인정보는 삭제되고 공유한 글은
            익명으로 남아요.
          </MetaText>
          <NativeButton
            disabled={state.loading}
            label="회원 탈퇴"
            onPress={deleteAccount}
            tone="danger"
            fullWidth
          />
        </NativeCard>
      </NativeScroll>
    </NativeScreen>
  );
};

import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, type TextInputProps, View } from "react-native";
import { useMutation, useQuery } from "@apollo/client/react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useSession } from "@/providers/session-provider";

import {
  ACTIVATE_BOOST_MUTATION,
  BILLING_PRODUCTS_QUERY,
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  COMMUNITY_COMMENTS_QUERY,
  COMMUNITY_POSTS_QUERY,
  CONSUMABLE_BALANCE_QUERY,
  CREATE_COMMUNITY_COMMENT_MUTATION,
  CREATE_COMMUNITY_POST_MUTATION,
  LIKE_USER_MUTATION,
  LIKED_ME_CANDIDATES_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ROOM_READ_MUTATION,
  MATCH_CANDIDATES_QUERY,
  ME_QUERY,
  NOTIFICATIONS_QUERY,
  REPORT_COMMUNITY_COMMENT_MUTATION,
  REPORT_COMMUNITY_POST_MUTATION,
  REPORT_MESSAGE_MUTATION,
  REQUEST_ACCOUNT_DELETION_MUTATION,
  SEND_MESSAGE_MUTATION,
  SKIP_CANDIDATE_MUTATION,
  SUPERLIKE_MUTATION,
  UNDO_MATCH_ACTION_MUTATION,
  UPDATE_PROFILE_MUTATION,
} from "./operations";
import { selectAndUploadProfilePhoto } from "./profile-photo-upload";
import type {
  AppNotification,
  BillingProduct,
  ChatMessage,
  ChatRoom,
  CommunityComment,
  CommunityPost,
  ConsumableBalance,
  CurrentUser,
  InteractionResult,
  MatchCandidate,
} from "./types";
import {
  ContentPhoto,
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
  SectionHeading,
} from "./components";

const KOREAN_REGIONS = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

type MeData = { me: CurrentUser };
type CandidatesData = { matchCandidates: MatchCandidate[] };
type LikedCandidatesData = { likedMeCandidates: MatchCandidate[] };
type RoomsData = { chatRooms: ChatRoom[] };
type MessagesData = { chatMessages: ChatMessage[] };
type PostsData = { communityPosts: CommunityPost[] };
type CommentsData = { communityComments: CommunityComment[] };
type NotificationsData = { notifications: AppNotification[] };

export const TodayMatchesScreen = () => {
  const candidates = useQuery<CandidatesData>(MATCH_CANDIDATES_QUERY);
  const [like] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const [skip] = useMutation<{ skipMatchCandidate: boolean }>(SKIP_CANDIDATE_MUTATION);
  const [superLike] = useMutation<{ superLikeUser: InteractionResult }>(SUPERLIKE_MUTATION);
  const [undo] = useMutation<{ undoLastMatchAction: { reverted: boolean } }>(
    UNDO_MATCH_ACTION_MUTATION,
  );
  const [boost] = useMutation<{ activateBoost: { activeUntil: string } }>(ACTIVATE_BOOST_MUTATION);
  const candidate = candidates.data?.matchCandidates[0];

  const refresh = () => void candidates.refetch();
  const act = async (kind: "like" | "skip" | "superlike") => {
    if (!candidate) return;
    try {
      if (kind === "skip") {
        await skip({ variables: { userId: candidate.id } });
      } else {
        const response =
          kind === "like"
            ? await like({ variables: { userId: candidate.id } })
            : await superLike({ variables: { userId: candidate.id } });
        const result = response.data?.[kind === "like" ? "likeUser" : "superLikeUser"];
        if (result?.matched && result.roomId) {
          Alert.alert("서로 관심이 닿았어요", "바로 대화를 시작해 볼까요?", [
            { text: "나중에", style: "cancel" },
            { text: "대화하기", onPress: () => router.push(`/rooms/${result.roomId}`) },
          ]);
        }
      }
      refresh();
    } catch (error) {
      showActionError(error);
    }
  };

  const undoLast = async () => {
    try {
      const response = await undo();
      if (!response.data?.undoLastMatchAction.reverted) {
        Alert.alert("되돌릴 선택이 없어요", "새로운 인연을 살펴봐 주세요.");
        return;
      }
      refresh();
    } catch (error) {
      showActionError(error);
    }
  };

  const activateBoost = async () => {
    try {
      const response = await boost();
      const activeUntil = response.data?.activateBoost.activeUntil;
      Alert.alert(
        "부스트를 시작했어요",
        activeUntil ? `${formatTime(activeUntil)}까지 더 많은 사람에게 보여드릴게요.` : "",
      );
    } catch (error) {
      showActionError(error);
    }
  };

  return (
    <>
      <NativeScreen>
        <NativeScroll>
          {candidates.loading ? <LoadingState /> : null}
          {candidates.error ? <ErrorState /> : null}
          {!candidates.loading && !candidates.error && !candidate ? (
            <EmptyState
              title="오늘의 인연을 모두 살펴봤어요"
              body="다음 추천이 준비되면 알려드릴게요."
            />
          ) : null}
          {candidate ? (
            <View style={styles.stack}>
              <NativeCard>
                <ContentPhoto
                  label={`${candidate.userName}님의 대표 사진`}
                  uri={candidate.photos[0]?.url}
                />
                <View style={styles.profileHeader}>
                  <View style={styles.stackTight}>
                    <Text style={styles.personName}>
                      {candidate.userName} {candidate.age}세
                    </Text>
                    <MetaText>{candidate.region}</MetaText>
                  </View>
                  {candidate.boostActive ? (
                    <Text style={styles.statusText}>지금 더 많은 사람에게 보여지고 있어요</Text>
                  ) : null}
                </View>
                <Text style={styles.intro}>
                  {candidate.intro || "반가워요. 이야기를 나눠 보고 싶어요."}
                </Text>
                <View style={styles.actionRow}>
                  <View style={styles.actionGrow}>
                    <NativeButton
                      label="이번엔 넘기기"
                      onPress={() => void act("skip")}
                      tone="secondary"
                      fullWidth
                    />
                  </View>
                  <View style={styles.actionGrow}>
                    <NativeButton label="관심 보내기" onPress={() => void act("like")} fullWidth />
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <View style={styles.actionGrow}>
                    <NativeButton
                      label="슈퍼라이크"
                      onPress={() => void act("superlike")}
                      tone="quiet"
                      fullWidth
                    />
                  </View>
                  <View style={styles.actionGrow}>
                    <NativeButton
                      label="되돌리기"
                      onPress={() => void undoLast()}
                      tone="quiet"
                      fullWidth
                    />
                  </View>
                </View>
              </NativeCard>
              <NativeButton
                label="30분 부스트 사용하기"
                onPress={() => void activateBoost()}
                tone="secondary"
                fullWidth
              />
            </View>
          ) : null}
        </NativeScroll>
      </NativeScreen>
      {process.env.EXPO_OS === "ios" ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="bell" onPress={() => router.push("/notifications")}>
            <Stack.Toolbar.Label>알림</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
    </>
  );
};

export const CommunityScreen = () => {
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  return (
    <NativeScreen>
      <NativeScroll>
        <SectionHeading
          title="지금 나누는 이야기"
          action={
            <NativeButton
              label="글 쓰기"
              onPress={() => router.push("/community/new")}
              tone="quiet"
            />
          }
        />
        {posts.loading ? <LoadingState /> : null}
        {posts.error ? <ErrorState /> : null}
        {!posts.loading && !posts.error && posts.data?.communityPosts.length === 0 ? (
          <EmptyState title="첫 이야기를 남겨 보세요" body="가볍게 시작해도 좋아요." />
        ) : null}
        {posts.data?.communityPosts.map((post) => (
          <Pressable
            key={post.id}
            onPress={() => router.push(`/community/${post.id}`)}
            style={styles.pressableCard}
          >
            <NativeCard>
              <View style={styles.postMeta}>
                <MetaText>{post.authorName}</MetaText>
                <MetaText>{formatRelativeDate(post.createdAt)}</MetaText>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text numberOfLines={2} style={styles.postBody}>
                {post.body}
              </Text>
              <MetaText>댓글 {post.commentCount}개</MetaText>
            </NativeCard>
          </Pressable>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};

export const CommunityPostScreen = () => {
  const postId = useRouteParam("post-id");
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  const comments = useQuery<CommentsData>(COMMUNITY_COMMENTS_QUERY, {
    skip: !postId,
    variables: { postId },
  });
  const [createComment, commentState] = useMutation<{ createCommunityComment: CommunityComment }>(
    CREATE_COMMUNITY_COMMENT_MUTATION,
  );
  const [reportComment] = useMutation<{ reportCommunityComment: boolean }>(
    REPORT_COMMUNITY_COMMENT_MUTATION,
  );
  const [report] = useMutation<{ reportCommunityPost: boolean }>(REPORT_COMMUNITY_POST_MUTATION);
  const [body, setBody] = useState("");
  const post = posts.data?.communityPosts.find((item) => item.id === postId);

  const submitComment = async () => {
    if (!postId || !body.trim()) return;
    try {
      await createComment({ variables: { input: { postId, body: body.trim() } } });
      setBody("");
      void comments.refetch();
      void posts.refetch();
    } catch (error) {
      showActionError(error);
    }
  };

  const reportPost = () => {
    if (!postId) return;
    Alert.alert("이 글을 신고할까요?", "운영팀이 내용을 확인해요.", [
      { text: "취소", style: "cancel" },
      {
        text: "신고하기",
        style: "destructive",
        onPress: () => {
          void report({ variables: { input: { postId, reason: "사용자 신고" } } })
            .then(() => Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."))
            .catch(showActionError);
        },
      },
    ]);
  };

  return (
    <NativeScreen>
      <NativeScroll>
        {posts.loading ? <LoadingState /> : null}
        {!posts.loading && !post ? (
          <EmptyState
            title="글을 찾을 수 없어요"
            body="목록으로 돌아가 다른 이야기를 확인해 보세요."
          />
        ) : null}
        {post ? (
          <NativeCard>
            <View style={styles.postMeta}>
              <MetaText>{post.authorName}</MetaText>
              <MetaText>{formatRelativeDate(post.createdAt)}</MetaText>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.detailBody}>{post.body}</Text>
            <NativeButton label="글 신고하기" onPress={reportPost} tone="quiet" />
          </NativeCard>
        ) : null}
        <SectionHeading title="댓글" />
        {comments.loading ? <LoadingState /> : null}
        {comments.data?.communityComments.map((comment) => (
          <NativeCard key={comment.id}>
            <View style={styles.postMeta}>
              <MetaText>{comment.authorName}</MetaText>
              <MetaText>{formatRelativeDate(comment.createdAt)}</MetaText>
            </View>
            <Text style={styles.detailBody}>{comment.body}</Text>
            <NativeButton
              label="댓글 신고하기"
              onPress={() => {
                Alert.alert("이 댓글을 신고할까요?", "운영팀이 내용을 확인해요.", [
                  { text: "취소", style: "cancel" },
                  {
                    text: "신고하기",
                    style: "destructive",
                    onPress: () => {
                      void reportComment({
                        variables: { input: { commentId: comment.id, reason: "사용자 신고" } },
                      })
                        .then(() =>
                          Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."),
                        )
                        .catch(showActionError);
                    },
                  },
                ]);
              }}
              tone="quiet"
            />
          </NativeCard>
        ))}
        <View style={styles.composer}>
          <NativeTextInput
            multiline
            onChangeText={setBody}
            placeholder="댓글을 남겨 보세요"
            style={styles.input}
            value={body}
          />
          <NativeButton
            disabled={!body.trim() || commentState.loading}
            label="댓글 등록"
            onPress={() => void submitComment()}
          />
        </View>
      </NativeScroll>
    </NativeScreen>
  );
};

export const CommunityWriteScreen = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [createPost, state] = useMutation<{ createCommunityPost: CommunityPost }>(
    CREATE_COMMUNITY_POST_MUTATION,
  );
  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    try {
      await createPost({
        variables: { input: { title: title.trim(), body: body.trim() } },
        refetchQueries: [COMMUNITY_POSTS_QUERY],
      });
      router.back();
    } catch (error) {
      showActionError(error);
    }
  };

  return (
    <NativeScreen>
      <NativeScroll>
        <Text style={styles.guide}>다른 사람을 존중하는 말로 편하게 이야기해 주세요.</Text>
        <NativeTextInput
          maxLength={80}
          onChangeText={setTitle}
          placeholder="제목"
          style={styles.input}
          value={title}
        />
        <NativeTextInput
          maxLength={1000}
          multiline
          onChangeText={setBody}
          placeholder="어떤 이야기를 나누고 싶나요?"
          style={[styles.input, styles.inputLarge]}
          textAlignVertical="top"
          value={body}
        />
        <NativeButton
          disabled={!title.trim() || !body.trim() || state.loading}
          label="게시하기"
          onPress={() => void submit()}
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};

export const LikesScreen = () => {
  const likes = useQuery<LikedCandidatesData>(LIKED_ME_CANDIDATES_QUERY);
  const [like] = useMutation<{ likeUser: InteractionResult }>(LIKE_USER_MUTATION);
  const sendInterest = async (candidate: MatchCandidate) => {
    try {
      const response = await like({ variables: { userId: candidate.id } });
      const result = response.data?.likeUser;
      if (result?.matched && result.roomId) router.push(`/rooms/${result.roomId}`);
      void likes.refetch();
    } catch (error) {
      showActionError(error);
    }
  };
  return (
    <NativeScreen>
      <NativeScroll>
        <Text style={styles.guide}>나에게 관심을 보낸 사람을 확인해 보세요.</Text>
        {likes.loading ? <LoadingState /> : null}
        {likes.error ? (
          <NativeCard>
            <Text style={styles.postTitle}>이 기능은 구독에서 이용할 수 있어요</Text>
            <MetaText>나를 좋아한 사람을 보고 싶다면 플랜을 확인해 보세요.</MetaText>
            <NativeButton label="플랜 확인하기" onPress={() => router.push("/premium")} fullWidth />
          </NativeCard>
        ) : null}
        {!likes.loading && !likes.error && likes.data?.likedMeCandidates.length === 0 ? (
          <EmptyState
            title="아직 받은 관심이 없어요"
            body="오늘의 인연에서 먼저 마음을 전해 보세요."
          />
        ) : null}
        {likes.data?.likedMeCandidates.map((candidate) => (
          <NativeCard key={candidate.id}>
            <ContentPhoto
              height={144}
              label={`${candidate.userName}님의 사진`}
              uri={candidate.photos[0]?.url}
            />
            <Text style={styles.personName}>
              {candidate.userName} {candidate.age}세
            </Text>
            <MetaText>{candidate.region}</MetaText>
            <Text style={styles.intro}>{candidate.intro}</Text>
            <NativeButton
              label="관심 보내기"
              onPress={() => void sendInterest(candidate)}
              fullWidth
            />
          </NativeCard>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};

export const RoomsScreen = () => {
  const rooms = useQuery<RoomsData>(CHAT_ROOMS_QUERY);
  return (
    <NativeScreen>
      <NativeScroll>
        {rooms.loading ? <LoadingState /> : null}
        {rooms.error ? <ErrorState /> : null}
        {!rooms.loading && !rooms.error && rooms.data?.chatRooms.length === 0 ? (
          <EmptyState
            title="아직 시작한 대화가 없어요"
            body="서로 관심이 닿으면 여기에서 대화를 이어갈 수 있어요."
          />
        ) : null}
        {rooms.data?.chatRooms.map((room) => (
          <Pressable
            key={room.id}
            onPress={() => router.push(`/rooms/${room.id}`)}
            style={styles.pressableCard}
          >
            <NativeCard>
              <View style={styles.roomRow}>
                <View style={styles.roomText}>
                  <Text style={styles.postTitle}>{room.name}</Text>
                  <MetaText>{room.lastMessage ?? "첫 인사를 건네 보세요."}</MetaText>
                </View>
                {room.unreadCount > 0 ? (
                  <Text style={styles.unreadText}>새 메시지 {room.unreadCount}개</Text>
                ) : null}
              </View>
            </NativeCard>
          </Pressable>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};

export const RoomScreen = () => {
  const roomId = useRouteParam("room-id");
  const me = useQuery<MeData>(ME_QUERY);
  const messages = useQuery<MessagesData>(CHAT_MESSAGES_QUERY, {
    skip: !roomId,
    variables: { input: { roomId, first: 100 } },
    pollInterval: 8_000,
  });
  const [markRead] = useMutation<{ markChatRoomRead: boolean }>(MARK_ROOM_READ_MUTATION);
  const [send, sendState] = useMutation<{ sendChatMessage: ChatMessage }>(SEND_MESSAGE_MUTATION);
  const [report] = useMutation<{ reportChatMessage: boolean }>(REPORT_MESSAGE_MUTATION);
  const [text, setText] = useState("");

  useEffect(() => {
    if (roomId) void markRead({ variables: { input: { roomId } } });
  }, [markRead, roomId]);

  const sendMessage = async () => {
    if (!roomId || !text.trim()) return;
    try {
      await send({
        variables: {
          input: { roomId, text: text.trim(), idempotencyKey: `${Date.now()}-${Math.random()}` },
        },
      });
      setText("");
      void messages.refetch();
    } catch (error) {
      showActionError(error);
    }
  };

  const reportMessage = (messageId: string) => {
    Alert.alert("이 메시지를 신고할까요?", "운영팀이 내용을 확인해요.", [
      { text: "취소", style: "cancel" },
      {
        text: "신고하기",
        style: "destructive",
        onPress: () => {
          void report({ variables: { input: { messageId, reason: "사용자 신고" } } })
            .then(() => Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."))
            .catch(showActionError);
        },
      },
    ]);
  };

  return (
    <NativeScreen>
      <NativeScroll>
        {messages.loading ? <LoadingState /> : null}
        {messages.data?.chatMessages.map((message) => {
          const mine = message.senderUserId === me.data?.me.id;
          return (
            <View key={message.id} style={mine ? styles.messageMine : styles.messageOther}>
              <View style={mine ? styles.bubbleMine : styles.bubbleOther}>
                <Text style={mine ? styles.bubbleMineText : styles.bubbleOtherText}>
                  {message.text}
                </Text>
              </View>
              <View style={styles.messageMeta}>
                <MetaText>{formatRelativeDate(message.createdAt)}</MetaText>
                {!mine ? (
                  <NativeButton
                    label="신고"
                    onPress={() => reportMessage(message.id)}
                    tone="quiet"
                  />
                ) : null}
              </View>
            </View>
          );
        })}
        {!messages.loading && messages.data?.chatMessages.length === 0 ? (
          <EmptyState title="첫 인사를 기다리고 있어요" body="짧고 편안한 인사부터 건네 보세요." />
        ) : null}
        <View style={styles.composer}>
          <NativeTextInput
            maxLength={90}
            multiline
            onChangeText={setText}
            placeholder="메시지 입력"
            style={styles.input}
            value={text}
          />
          <NativeButton
            disabled={!text.trim() || sendState.loading}
            label="보내기"
            onPress={() => void sendMessage()}
          />
        </View>
      </NativeScroll>
    </NativeScreen>
  );
};

export const ProfileScreen = () => {
  const me = useQuery<MeData>(ME_QUERY);
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY);
  if (me.loading)
    return (
      <NativeScreen>
        <NativeScroll>
          <LoadingState />
        </NativeScroll>
      </NativeScreen>
    );
  if (!me.data?.me)
    return (
      <NativeScreen>
        <NativeScroll>
          <ErrorState />
        </NativeScroll>
      </NativeScreen>
    );
  const user = me.data.me;
  return (
    <NativeScreen>
      <NativeScroll>
        <NativeCard>
          <ContentPhoto height={144} label="내 대표 사진" uri={user.photos[0]?.url} />
          <Text style={styles.personName}>{user.userName || "프로필을 완성해 주세요"}</Text>
          <MetaText>{user.region ?? "지역을 설정해 주세요"}</MetaText>
          <Text style={styles.intro}>
            {user.intro || "소개를 작성하면 더 잘 맞는 인연을 추천해 드려요."}
          </Text>
          <NativeButton
            label="프로필 편집"
            onPress={() => router.push("/profile/edit")}
            fullWidth
          />
        </NativeCard>
        <SectionHeading title="내 이용권" />
        <NativeCard>
          <View style={styles.roomRow}>
            <View style={styles.roomText}>
              <Text style={styles.postTitle}>
                슈퍼라이크 {balance.data?.consumableBalance.superLikeCredits ?? 0}개
              </Text>
              <MetaText>부스트 {balance.data?.consumableBalance.boostCredits ?? 0}회</MetaText>
            </View>
            <NativeButton
              label="이용권 보기"
              onPress={() => router.push("/premium")}
              tone="quiet"
            />
          </View>
        </NativeCard>
        <View style={styles.stackTight}>
          <NativeButton
            label="알림"
            onPress={() => router.push("/notifications")}
            tone="secondary"
            fullWidth
          />
          <NativeButton
            label="설정"
            onPress={() => router.push("/settings")}
            tone="secondary"
            fullWidth
          />
        </View>
      </NativeScroll>
    </NativeScreen>
  );
};

export const ProfileFormScreen = ({ completion = false }: { completion?: boolean }) => {
  const me = useQuery<MeData>(ME_QUERY);
  const [updateProfile, updateState] = useMutation<{ updateUserProfile: CurrentUser }>(
    UPDATE_PROFILE_MUTATION,
  );
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [region, setRegion] = useState("");
  const [interestedGender, setInterestedGender] = useState("everyone");
  const [intro, setIntro] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const user = me.data?.me;
    if (!user) return;
    setUserName(user.userName);
    setBirthDate(user.birthDate ?? "");
    setRegion(user.region ?? "");
    setInterestedGender(user.interestedGender ?? "everyone");
    setIntro(user.intro);
    setPhotoUrls(
      [...user.photos].sort((a, b) => a.position - b.position).map((photo) => photo.url),
    );
  }, [me.data?.me]);

  const addPhoto = async () => {
    if (photoUrls.length >= 3) {
      Alert.alert("사진은 최대 3장까지 추가할 수 있어요");
      return;
    }
    setUploading(true);
    try {
      const publicUrl = await selectAndUploadProfilePhoto();
      if (publicUrl) setPhotoUrls((current) => [...current, publicUrl]);
    } catch (error) {
      showActionError(error);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (
      !userName.trim() ||
      !birthDate.trim() ||
      !region ||
      !intro.trim() ||
      photoUrls.length === 0
    ) {
      Alert.alert(
        "프로필을 모두 채워 주세요",
        "사진, 이름, 생년월일, 지역, 소개와 관심 대상을 확인해 주세요.",
      );
      return;
    }
    try {
      await updateProfile({
        variables: { input: { userName, birthDate, region, interestedGender, intro, photoUrls } },
        refetchQueries: [ME_QUERY],
      });
      if (completion) {
        router.replace("/matches");
      } else {
        router.back();
      }
    } catch (error) {
      showActionError(error);
    }
  };

  return (
    <NativeScreen>
      <NativeScroll>
        <Text style={styles.guide}>
          사진 1장은 꼭 올려 주세요. 추가 사진은 최대 2장까지 더 올릴 수 있어요.
        </Text>
        <SectionHeading title={`사진 ${photoUrls.length}/3`} />
        {photoUrls.map((url, index) => (
          <NativeCard key={url}>
            <ContentPhoto height={144} label={`프로필 사진 ${index + 1}`} uri={url} />
            <NativeButton
              label={index === 0 ? "대표 사진 삭제" : "사진 삭제"}
              onPress={() => setPhotoUrls((current) => current.filter((item) => item !== url))}
              tone="quiet"
              fullWidth
            />
          </NativeCard>
        ))}
        <NativeButton
          disabled={uploading || photoUrls.length >= 3}
          label={uploading ? "사진을 올리는 중" : "사진 추가"}
          onPress={() => void addPhoto()}
          tone="secondary"
          fullWidth
        />
        <FormLabel label="이름" />
        <NativeTextInput
          maxLength={40}
          onChangeText={setUserName}
          placeholder="이름"
          style={styles.input}
          value={userName}
        />
        <FormLabel label="생년월일" hint="YYYY-MM-DD" />
        <NativeTextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setBirthDate}
          placeholder="1998-01-01"
          style={styles.input}
          value={birthDate}
        />
        <FormLabel label="지역" />
        <View style={styles.choiceWrap}>
          {KOREAN_REGIONS.map((item) => (
            <ChoiceButton
              key={item}
              label={item}
              selected={region === item}
              onPress={() => setRegion(item)}
            />
          ))}
        </View>
        <FormLabel label="관심 대상" />
        <View style={styles.choiceWrap}>
          <ChoiceButton
            label="남성"
            selected={interestedGender === "male"}
            onPress={() => setInterestedGender("male")}
          />
          <ChoiceButton
            label="여성"
            selected={interestedGender === "female"}
            onPress={() => setInterestedGender("female")}
          />
          <ChoiceButton
            label="모두"
            selected={interestedGender === "everyone"}
            onPress={() => setInterestedGender("everyone")}
          />
        </View>
        <FormLabel label="소개" hint="60자 이내" />
        <NativeTextInput
          maxLength={60}
          multiline
          onChangeText={setIntro}
          placeholder="내 이야기를 짧게 들려주세요"
          style={[styles.input, styles.inputLarge]}
          textAlignVertical="top"
          value={intro}
        />
        <NativeButton
          disabled={updateState.loading}
          label={completion ? "프로필 완성하기" : "저장하기"}
          onPress={() => void save()}
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};

export const NotificationsScreen = () => {
  const notifications = useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
  const [markRead] = useMutation<{ markNotificationRead: boolean }>(
    MARK_NOTIFICATION_READ_MUTATION,
  );
  const visit = async (notification: AppNotification) => {
    try {
      if (!notification.readAt) await markRead({ variables: { notificationId: notification.id } });
      if (notification.route) router.push(notification.route);
      void notifications.refetch();
    } catch (error) {
      showActionError(error);
    }
  };
  return (
    <NativeScreen>
      <NativeScroll>
        {notifications.loading ? <LoadingState /> : null}
        {notifications.error ? <ErrorState /> : null}
        {!notifications.loading &&
        !notifications.error &&
        notifications.data?.notifications.length === 0 ? (
          <EmptyState
            title="새 알림이 없어요"
            body="좋아요, 매치, 메시지와 댓글 소식을 여기에서 알려드릴게요."
          />
        ) : null}
        {notifications.data?.notifications.map((notification) => (
          <Pressable
            key={notification.id}
            onPress={() => void visit(notification)}
            style={styles.pressableCard}
          >
            <NativeCard>
              <View style={styles.postMeta}>
                <MetaText>{notification.readAt ? "확인함" : "새 알림"}</MetaText>
                <MetaText>{formatRelativeDate(notification.createdAt)}</MetaText>
              </View>
              <Text style={styles.postTitle}>{notification.title}</Text>
              <Text style={styles.postBody}>{notification.body}</Text>
            </NativeCard>
          </Pressable>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};

export const PremiumScreen = () => {
  const products = useQuery<{ billingProducts: BillingProduct[] }>(BILLING_PRODUCTS_QUERY);
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY);
  const purchase = (product: BillingProduct) => {
    Alert.alert(
      "결제를 준비하고 있어요",
      `${product.name} 결제는 RevenueCat이 연결된 실제 앱 빌드에서 진행할 수 있어요. 현재 환경에는 해당 네이티브 결제 모듈이 설정되지 않았어요.`,
    );
  };
  const grouped = useMemo(() => {
    const all = products.data?.billingProducts ?? [];
    return {
      subscriptions: all.filter((item) => item.kind === "subscription"),
      items: all.filter((item) => item.kind !== "subscription"),
    };
  }, [products.data?.billingProducts]);
  return (
    <NativeScreen>
      <NativeScroll>
        <NativeCard>
          <Text style={styles.postTitle}>더 넓게, 더 편하게 만나 보세요</Text>
          <MetaText>구독과 아이템 결제는 앱 스토어 결제를 통해 안전하게 처리돼요.</MetaText>
          <Text style={styles.statusText}>
            보유 슈퍼라이크 {balance.data?.consumableBalance.superLikeCredits ?? 0}개, 부스트{" "}
            {balance.data?.consumableBalance.boostCredits ?? 0}회
          </Text>
        </NativeCard>
        <SectionHeading title="구독" />
        {grouped.subscriptions.map((product) => (
          <ProductCard key={product.id} product={product} onPress={() => purchase(product)} />
        ))}
        <SectionHeading title="아이템" />
        {grouped.items.map((product) => (
          <ProductCard key={product.id} product={product} onPress={() => purchase(product)} />
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};

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

const ProductCard = ({ product, onPress }: { product: BillingProduct; onPress: () => void }) => (
  <NativeCard>
    <View style={styles.roomRow}>
      <View style={styles.roomText}>
        <Text style={styles.postTitle}>{product.name}</Text>
        <MetaText>
          {product.kind === "subscription" ? "매월 자동 갱신" : "필요할 때 한 번만 사용"}
        </MetaText>
      </View>
      <Text style={styles.price}>{product.priceKrw.toLocaleString("ko-KR")}원</Text>
    </View>
    <NativeButton label="구매하기" onPress={onPress} fullWidth />
  </NativeCard>
);

const ChoiceButton = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
    <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
  </Pressable>
);

const FormLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <View style={styles.formLabel}>
    <Text style={styles.formLabelText}>{label}</Text>
    {hint ? <MetaText>{hint}</MetaText> : null}
  </View>
);

const NativeTextInput = ({ placeholderTextColor, ...props }: TextInputProps) => {
  const { theme } = useUnistyles();
  return <TextInput {...props} placeholderTextColor={placeholderTextColor ?? theme.colors.muted} />;
};

const ErrorState = () => (
  <EmptyState title="내용을 불러오지 못했어요" body="잠시 후 다시 시도해 주세요." />
);

const useRouteParam = (name: string): string | undefined => {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const value = params[name];
  return Array.isArray(value) ? value[0] : value;
};

const showActionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("PROFILE_COMPLETION_REQUIRED")) {
    Alert.alert("프로필을 먼저 완성해 주세요", "사진과 기본 정보를 채우면 인연을 추천해 드릴게요.");
    router.push("/profile-completion");
    return;
  }
  if (message.includes("LIKE_LIMIT_REACHED")) {
    Alert.alert("오늘의 관심 보내기를 모두 사용했어요", "내일 다시 보내거나 플랜을 확인해 보세요.");
    return;
  }
  if (
    message.includes("SUPERLIKE_CREDITS_REQUIRED") ||
    message.includes("BOOST_CREDITS_REQUIRED")
  ) {
    Alert.alert("이용권이 필요해요", "구독과 아이템에서 필요한 이용권을 확인해 보세요.", [
      { text: "나중에", style: "cancel" },
      { text: "이용권 보기", onPress: () => router.push("/premium") },
    ]);
    return;
  }
  if (message.includes("R2_CONFIG_REQUIRED")) {
    Alert.alert(
      "사진 업로드를 준비 중이에요",
      "안전한 사진 저장소 설정이 완료되면 사진을 올릴 수 있어요.",
    );
    return;
  }
  Alert.alert("처리하지 못했어요", "잠시 후 다시 시도해 주세요.");
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(value));

const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.md },
  stackTight: { gap: theme.spacing.sm },
  profileHeader: { gap: theme.spacing.xs },
  personName: { color: theme.colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  intro: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
  statusText: { color: theme.colors.primary, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  actionRow: { flexDirection: "row", gap: theme.spacing.sm },
  actionGrow: { flex: 1 },
  pressableCard: { borderRadius: 20 },
  postMeta: { flexDirection: "row", justifyContent: "space-between" },
  postTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  postBody: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
  detailBody: { color: theme.colors.text, fontSize: 16, lineHeight: 25 },
  guide: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
  composer: { gap: theme.spacing.sm, paddingBottom: theme.spacing.md },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 13,
  },
  inputLarge: { minHeight: 150 },
  roomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  roomText: { flex: 1, gap: theme.spacing.xs },
  unreadText: { color: theme.colors.primary, fontSize: 13, fontWeight: "700", textAlign: "right" },
  messageMine: { alignItems: "flex-end", gap: theme.spacing.xs },
  messageOther: { alignItems: "flex-start", gap: theme.spacing.xs },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    maxWidth: "84%",
    padding: theme.spacing.md,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 18,
    maxWidth: "84%",
    padding: theme.spacing.md,
  },
  bubbleMineText: { color: theme.colors.primaryText, fontSize: 16, lineHeight: 22 },
  bubbleOtherText: { color: theme.colors.text, fontSize: 16, lineHeight: 22 },
  messageMeta: { alignItems: "center", flexDirection: "row", gap: theme.spacing.xs },
  formLabel: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  formLabelText: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  choice: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choiceSelected: { backgroundColor: theme.colors.primary },
  choiceText: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  choiceTextSelected: { color: theme.colors.primaryText },
  price: { color: theme.colors.text, fontSize: 17, fontWeight: "800" },
}));

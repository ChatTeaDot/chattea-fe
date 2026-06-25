import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  blockUser,
  createCommunityComment,
  createCommunityPost,
  createUpload,
  getUnreadMessageSummary,
  getMySubscription,
  likeUser,
  listBlackMatchCandidates,
  listLikedMeCandidates,
  listMatchCandidates,
  listCommunityPosts,
  listMessages,
  listRooms,
  listSubscriptionPlans,
  markRoomRead,
  rateProfile,
  reportCommunityPost,
  reportMessage,
  sendMessage,
  subscribeToMessageCreated,
  subscribeToMessageDeleted,
  subscribeToMessageUpdated,
  subscribeToReadReceiptUpdated,
  subscribeToTypingChanged,
  setTyping,
  uploadFileToSignedUrl,
} from "./api";
import { Message } from "./types";

export function useRooms() {
  return useQuery({ queryKey: ["rooms"], queryFn: listRooms });
}

export function useCommunityPosts() {
  return useQuery({ queryKey: ["community-posts"], queryFn: listCommunityPosts });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityPost,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

export function useCreateCommunityComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityComment,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

export function useReportCommunityPost() {
  return useMutation({ mutationFn: reportCommunityPost });
}

export function useSubscriptionPlans() {
  return useQuery({ queryKey: ["subscription-plans"], queryFn: listSubscriptionPlans });
}

export function useMySubscription() {
  return useQuery({ queryKey: ["my-subscription"], queryFn: getMySubscription });
}

export function useUnreadMessageSummary() {
  return useMutation({ mutationFn: getUnreadMessageSummary });
}

export function useMatchCandidates() {
  return useQuery({ queryKey: ["match-candidates"], queryFn: listMatchCandidates });
}

export function useBlackMatchCandidates(enabled: boolean) {
  return useQuery({
    queryKey: ["black-match-candidates"],
    queryFn: listBlackMatchCandidates,
    enabled,
  });
}

export function useLikedMeCandidates(enabled: boolean) {
  return useQuery({
    queryKey: ["liked-me-candidates"],
    queryFn: listLikedMeCandidates,
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}

export function useLikeUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeUser,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ["match-candidates"] });
      void queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useRateProfile() {
  return useMutation({ mutationFn: rateProfile });
}

export function useMessages(roomId: string) {
  const query = useQuery({ queryKey: ["messages", roomId], queryFn: () => listMessages(roomId) });
  const queryClient = useQueryClient();
  const refetchMessages = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
  }, [queryClient, roomId]);

  useEffect(() => {
    const disposeCreated = subscribeToMessageCreated({
      roomId,
      onMessage(message) {
        queryClient.setQueryData<Message[]>(["messages", roomId], (current = []) =>
          current.some((item) => item.id === message.id) ? current : [...current, message],
        );
      },
      onError: refetchMessages,
    });
    const disposeUpdated = subscribeToMessageUpdated({
      roomId,
      onMessage(message) {
        queryClient.setQueryData<Message[]>(["messages", roomId], (current = []) =>
          current.map((item) => (item.id === message.id ? { ...item, ...message } : item)),
        );
      },
      onError: refetchMessages,
    });
    const disposeDeleted = subscribeToMessageDeleted({
      roomId,
      onMessageId(messageId) {
        queryClient.setQueryData<Message[]>(["messages", roomId], (current = []) =>
          current.filter((item) => item.id !== messageId),
        );
      },
      onError: refetchMessages,
    });

    return () => {
      disposeCreated();
      disposeUpdated();
      disposeDeleted();
    };
  }, [queryClient, refetchMessages, roomId]);

  return query;
}

export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess(serverMessage, variables) {
      queryClient.setQueryData<Message[]>(["messages", roomId], (current = []) =>
        current.map((message) =>
          message.id === variables.idempotencyKey ? serverMessage : message,
        ),
      );
    },
  });
}

export function useRoomRealtime(roomId: string) {
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [readReceiptVersion, setReadReceiptVersion] = useState(0);

  useEffect(() => {
    const disposeTyping = subscribeToTypingChanged({
      roomId,
      onTyping: setIsPeerTyping,
    });
    const disposeRead = subscribeToReadReceiptUpdated({
      roomId,
      onRead(read) {
        if (read) {
          setReadReceiptVersion((version) => version + 1);
        }
      },
    });

    return () => {
      disposeTyping();
      disposeRead();
    };
  }, [roomId]);

  return { isPeerTyping, readReceiptVersion };
}

export function useMarkRoomRead() {
  return useMutation({ mutationFn: markRoomRead });
}

export function useSetTyping() {
  return useMutation({ mutationFn: setTyping });
}

export function useBlockUser() {
  return useMutation({ mutationFn: blockUser });
}

export function useReportMessage() {
  return useMutation({ mutationFn: reportMessage });
}

export function useCreateUpload() {
  return useMutation({ mutationFn: createUpload });
}

export function useUploadFileToSignedUrl() {
  return useMutation({ mutationFn: uploadFileToSignedUrl });
}

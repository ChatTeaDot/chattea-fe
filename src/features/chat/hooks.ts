import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import {
  blockUser,
  createCommunityComment,
  createCommunityPost,
  createUpload,
  getMySubscription,
  getUnreadMessageSummary,
  likeUser,
  listBlackMatchCandidates,
  listCommunityPosts,
  listLikedMeCandidates,
  listMatchCandidates,
  listMessages,
  listRooms,
  listSubscriptionPlans,
  markRoomRead,
  rateScore,
  reportCommunityPost,
  reportMessage,
  sendMessage,
  setTyping,
  subscribeToMessageCreated,
  subscribeToMessageDeleted,
  subscribeToMessageUpdated,
  subscribeToReadReceiptUpdated,
  subscribeToTypingChanged,
  uploadFileToSignedUrl,
} from "./api";
import { pickImageAttachment } from "./image-picker";
import { AttachmentDraft, Message } from "./types";

export const useRooms = () => {
  return useQuery({ queryKey: ["rooms"], queryFn: listRooms });
};

export const useCommunityPosts = () => {
  return useQuery({ queryKey: ["community-posts"], queryFn: listCommunityPosts });
};

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityPost,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

export const useCreateCommunityComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityComment,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

export const useReportCommunityPost = () => {
  return useMutation({ mutationFn: reportCommunityPost });
};

export const useSubscriptionPlans = () => {
  return useQuery({ queryKey: ["subscription-plans"], queryFn: listSubscriptionPlans });
};

export const useMySubscription = () => {
  return useQuery({ queryKey: ["my-subscription"], queryFn: getMySubscription });
};

export const useUnreadMessageSummary = () => {
  return useMutation({ mutationFn: getUnreadMessageSummary });
};

export const useMatchCandidates = () => {
  return useQuery({ queryKey: ["match-candidates"], queryFn: listMatchCandidates });
};

export const useBlackMatchCandidates = (enabled: boolean) => {
  return useQuery({
    queryKey: ["black-match-candidates"],
    queryFn: listBlackMatchCandidates,
    enabled,
  });
};

export const useLikedMeCandidates = (enabled: boolean) => {
  return useQuery({
    queryKey: ["liked-me-candidates"],
    queryFn: listLikedMeCandidates,
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
};

export const useLikeUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeUser,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ["match-candidates"] });
      void queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useRateScore = () => {
  return useMutation({ mutationFn: rateScore });
};

export const useMessages = (roomId: string) => {
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
};

export const useSendMessage = (roomId: string) => {
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
};

export const useRoomRealtime = (roomId: string) => {
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
};

export const useMarkRoomRead = () => {
  return useMutation({ mutationFn: markRoomRead });
};

export const useSetTyping = () => {
  return useMutation({ mutationFn: setTyping });
};

export const useBlockUser = () => {
  return useMutation({ mutationFn: blockUser });
};

export const useReportMessage = () => {
  return useMutation({ mutationFn: reportMessage });
};

export const useCreateUpload = () => {
  return useMutation({ mutationFn: createUpload });
};

export const useUploadFileToSignedUrl = () => {
  return useMutation({ mutationFn: uploadFileToSignedUrl });
};

export const useChatAttachments = () => {
  const createUploadMutation = useCreateUpload();
  const uploadFile = useUploadFileToSignedUrl();
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);

  const addAttachment = async () => {
    const picked = await pickImageAttachment();
    if (!picked) {
      return;
    }

    const localId = `attachment-${Date.now()}`;
    const attachment: AttachmentDraft = {
      id: localId,
      filename: picked.filename,
      contentType: picked.contentType,
      status: "signing",
    };

    setAttachments((current) => [...current, attachment]);

    try {
      const upload = await createUploadMutation.mutateAsync({
        filename: attachment.filename,
        contentType: attachment.contentType,
      });
      setAttachments((current) =>
        current.map((item) =>
          item.id === localId
            ? { ...item, id: upload.id, putUrl: upload.putUrl, status: "uploading" }
            : item,
        ),
      );
      await uploadFile.mutateAsync({
        putUrl: upload.putUrl,
        contentType: attachment.contentType,
        body: picked.body,
      });
      setAttachments((current) =>
        current.map((item) => (item.id === upload.id ? { ...item, status: "uploaded" } : item)),
      );
    } catch {
      setAttachments((current) =>
        current.map((item) => (item.id === localId ? { ...item, status: "failed" } : item)),
      );
    }
  };

  return { addAttachment, attachments };
};

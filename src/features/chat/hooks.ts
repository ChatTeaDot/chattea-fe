import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo, useState } from "react";

import { formatReceivedMessage, formatSentMessage, uploadFileToSignedUrl } from "./api";
import { replaceMessageInCache } from "./cache";
import {
  CHAT_MESSAGES_QUERY,
  CHAT_ROOMS_QUERY,
  CREATE_UPLOAD_MUTATION,
  getChatMessagesQueryOptions,
  MARK_CHAT_ROOM_READ_MUTATION,
  REPORT_CHAT_MESSAGE_MUTATION,
  SEND_CHAT_MESSAGE_MUTATION,
  SET_CHAT_TYPING_MUTATION,
  UNREAD_MESSAGE_SUMMARY_QUERY,
} from "./operations";
import { pickImageAttachment } from "./room/utils/image-picker";
import type { AiSummaryPreview, AttachmentDraft, Message, Upload } from "./types";

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export const useRooms = () => {
  const query = useQuery(CHAT_ROOMS_QUERY);
  return { ...query, data: query.data?.chatRooms };
};

export const useUnreadMessageSummary = () => {
  const client = useApolloClient();
  const execute = useCallback(
    async (input: { planId: string; unreadTexts: string[]; enabled: boolean }) => {
      const { data } = await client.query({
        query: UNREAD_MESSAGE_SUMMARY_QUERY,
        variables: { input },
        fetchPolicy: "network-only",
      });
      if (!data) {
        throw new Error("UNREAD_MESSAGE_SUMMARY_EMPTY_RESPONSE");
      }
      return data.unreadMessageSummary;
    },
    [client],
  );
  const mutate = useCallback(
    (
      input: { planId: string; unreadTexts: string[]; enabled: boolean },
      callbacks?: MutationCallbacks<AiSummaryPreview>,
    ) => {
      void execute(input).then(callbacks?.onSuccess).catch(callbacks?.onError);
    },
    [execute],
  );
  return { mutate, mutateAsync: execute };
};

export const useMessages = (roomId: string) => {
  const options = useMemo(() => getChatMessagesQueryOptions(roomId), [roomId]);
  const query = useQuery(CHAT_MESSAGES_QUERY, options);

  return {
    ...query,
    data: query.data?.chatMessages.map(formatReceivedMessage),
  };
};

export const useSendMessage = (roomId: string) => {
  const [runMutation, result] = useMutation(SEND_CHAT_MESSAGE_MUTATION);
  const execute = useCallback(
    async (input: { roomId: string; text: string; idempotencyKey: string }) => {
      const { data } = await runMutation({
        variables: { input },
        optimisticResponse: {
          sendChatMessage: {
            __typename: "ChatMessagePayload",
            id: input.idempotencyKey,
            roomId: input.roomId,
            text: input.text,
            createdAt: new Date().toISOString(),
          },
        },
        update: (cache, mutationResult) => {
          const message = mutationResult.data?.sendChatMessage;
          if (!message) {
            return;
          }
          replaceMessageInCache(cache, roomId, message, input.idempotencyKey);
        },
      });
      if (!data) {
        throw new Error("SEND_CHAT_MESSAGE_EMPTY_RESPONSE");
      }
      return formatSentMessage(data.sendChatMessage);
    },
    [roomId, runMutation],
  );
  const mutate = useCallback(
    (
      input: { roomId: string; text: string; idempotencyKey: string },
      callbacks?: MutationCallbacks<Message>,
    ) => {
      void execute(input).then(callbacks?.onSuccess).catch(callbacks?.onError);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useMarkRoomRead = () => {
  const [runMutation, result] = useMutation(MARK_CHAT_ROOM_READ_MUTATION);
  const execute = useCallback(
    async (roomId: string) => {
      const { data } = await runMutation({ variables: { input: { roomId } } });
      return data?.markChatRoomRead ?? false;
    },
    [runMutation],
  );
  const mutate = useCallback(
    (roomId: string, callbacks?: MutationCallbacks<boolean>) => {
      void execute(roomId).then(callbacks?.onSuccess).catch(callbacks?.onError);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useSetTyping = () => {
  const [runMutation, result] = useMutation(SET_CHAT_TYPING_MUTATION);
  const execute = useCallback(
    async (input: { roomId: string; typing: boolean }) => {
      const { data } = await runMutation({ variables: { input } });
      return data?.setChatTyping ?? false;
    },
    [runMutation],
  );
  const mutate = useCallback(
    (input: { roomId: string; typing: boolean }, callbacks?: MutationCallbacks<boolean>) => {
      void execute(input).then(callbacks?.onSuccess).catch(callbacks?.onError);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useReportMessage = () => {
  const [runMutation, result] = useMutation(REPORT_CHAT_MESSAGE_MUTATION);
  const execute = useCallback(
    async (input: { messageId: string; reason: string }) => {
      const { data } = await runMutation({ variables: { input } });
      return data?.reportChatMessage ?? false;
    },
    [runMutation],
  );
  const mutate = useCallback(
    (input: { messageId: string; reason: string }, callbacks?: MutationCallbacks<boolean>) => {
      void execute(input).then(callbacks?.onSuccess).catch(callbacks?.onError);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useCreateUpload = () => {
  const [runMutation, result] = useMutation(CREATE_UPLOAD_MUTATION);
  const execute = useCallback(
    async (input: { filename: string; contentType: string }) => {
      const { data } = await runMutation({ variables: { input } });
      if (!data) {
        throw new Error("CREATE_UPLOAD_EMPTY_RESPONSE");
      }
      return data.createUpload;
    },
    [runMutation],
  );
  const mutate = useCallback(
    (input: { filename: string; contentType: string }, callbacks?: MutationCallbacks<Upload>) => {
      void execute(input).then(callbacks?.onSuccess).catch(callbacks?.onError);
    },
    [execute],
  );
  return { ...result, mutate, mutateAsync: execute };
};

export const useUploadFileToSignedUrl = () => {
  const execute = useCallback(
    (input: { putUrl: string; contentType: string; body: Blob | ArrayBuffer | string }) =>
      uploadFileToSignedUrl(input),
    [],
  );
  const mutate = useCallback(
    (
      input: { putUrl: string; contentType: string; body: Blob | ArrayBuffer | string },
      callbacks?: MutationCallbacks<void>,
    ) => {
      void execute(input).then(callbacks?.onSuccess).catch(callbacks?.onError);
    },
    [execute],
  );
  return { mutate, mutateAsync: execute };
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

    let uploadId: string | null = null;
    try {
      const upload = await createUploadMutation.mutateAsync({
        filename: attachment.filename,
        contentType: attachment.contentType,
      });
      uploadId = upload.id;
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
        current.map((item) =>
          item.id === localId || item.id === uploadId ? { ...item, status: "failed" } : item,
        ),
      );
    }
  };

  return { addAttachment, attachments };
};

export { useRoomRealtime } from "./realtime";

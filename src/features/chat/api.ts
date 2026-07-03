import { gql } from "graphql-request";

import { createGraphQLSubscriptionClient, graphQLRequest } from "@/shared/graphql/client";

import {
  AiSummaryPreview,
  CommunityComment,
  CommunityPost,
  CurrentSubscription,
  LikeUserResult,
  MatchCandidate,
  Message,
  Room,
  ScoreSummary,
  SubscriptionPlan,
  Upload,
} from "./types";

type Fetcher = typeof fetch;

let uploadFetch: Fetcher = fetch;

export const setUploadFetcher = (fetcher: Fetcher) => {
  uploadFetch = fetcher;
};

export const listRooms = async (): Promise<Room[]> => {
  const data = await graphQLRequest<{ chatRooms: Room[] }>(gql`
    query ChatRooms {
      chatRooms {
        id
        name
        lastMessage
      }
    }
  `);

  return data.chatRooms;
};

export const listCommunityPosts = async (): Promise<CommunityPost[]> => {
  const data = await graphQLRequest<{ communityPosts: CommunityPost[] }>(gql`
    query CommunityPosts {
      communityPosts {
        id
        anonymousName
        title
        body
        commentCount
        createdAt
      }
    }
  `);

  return data.communityPosts;
};

export const createCommunityPost = async (input: {
  title: string;
  body: string;
}): Promise<CommunityPost> => {
  const data = await graphQLRequest<{ createCommunityPost: CommunityPost }>(
    gql`
      mutation CreateCommunityPost($input: CreateCommunityPostInput!) {
        createCommunityPost(input: $input) {
          id
          anonymousName
          title
          body
          commentCount
          createdAt
        }
      }
    `,
    { input },
  );

  return data.createCommunityPost;
};

export const createCommunityComment = async (input: {
  postId: string;
  body: string;
}): Promise<CommunityComment> => {
  const data = await graphQLRequest<{ createCommunityComment: CommunityComment }>(
    gql`
      mutation CreateCommunityComment($input: CreateCommunityCommentInput!) {
        createCommunityComment(input: $input) {
          id
          postId
          anonymousName
          body
          createdAt
        }
      }
    `,
    { input },
  );

  return data.createCommunityComment;
};

export const reportCommunityPost = async (input: {
  postId: string;
  reason: string;
}): Promise<boolean> => {
  const data = await graphQLRequest<{ reportCommunityPost: boolean }>(
    gql`
      mutation ReportCommunityPost($input: ReportCommunityPostInput!) {
        reportCommunityPost(input: $input)
      }
    `,
    { input },
  );

  return data.reportCommunityPost;
};

export const listSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const data = await graphQLRequest<{ subscriptionPlans: SubscriptionPlan[] }>(gql`
    query SubscriptionPlans {
      subscriptionPlans {
        id
        name
        monthlyPriceKrw
        benefits
      }
    }
  `);

  return data.subscriptionPlans;
};

export const getMySubscription = async (): Promise<CurrentSubscription> => {
  const data = await graphQLRequest<{ currentSubscription: CurrentSubscription }>(gql`
    query CurrentSubscription {
      currentSubscription {
        planId
      }
    }
  `);

  return data.currentSubscription;
};

export const getUnreadMessageSummary = async (input: {
  planId: string;
  unreadTexts: string[];
  enabled: boolean;
}): Promise<AiSummaryPreview> => {
  const data = await graphQLRequest<{ unreadMessageSummary: AiSummaryPreview }>(
    gql`
      query UnreadMessageSummary($input: UnreadMessageSummaryInput!) {
        unreadMessageSummary(input: $input) {
          available
          reason
          sourceText
          summary
        }
      }
    `,
    { input },
  );

  return data.unreadMessageSummary;
};

export const listMatchCandidates = async (): Promise<MatchCandidate[]> => {
  const data = await graphQLRequest<{ matchCandidates: MatchCandidate[] }>(gql`
    query MatchCandidates {
      matchCandidates {
        id
        userName
        intro
        likedByMe
        planId
        blackRecommended
      }
    }
  `);

  return data.matchCandidates;
};

export const listBlackMatchCandidates = async (): Promise<MatchCandidate[]> => {
  const data = await graphQLRequest<{ blackMatchCandidates: MatchCandidate[] }>(gql`
    query BlackMatchCandidates {
      blackMatchCandidates {
        id
        userName
        intro
        likedByMe
        planId
        blackRecommended
      }
    }
  `);

  return data.blackMatchCandidates;
};

export const listLikedMeCandidates = async (): Promise<MatchCandidate[]> => {
  const data = await graphQLRequest<{ likedMeCandidates: MatchCandidate[] }>(gql`
    query LikedMeCandidates {
      likedMeCandidates {
        id
        userName
        intro
        likedByMe
        planId
        blackRecommended
      }
    }
  `);

  return data.likedMeCandidates;
};

export const likeUser = async (userId: string): Promise<LikeUserResult> => {
  const data = await graphQLRequest<{ likeUser: LikeUserResult }>(
    gql`
      mutation LikeUser($userId: String!) {
        likeUser(userId: $userId) {
          matched
          roomId
        }
      }
    `,
    { userId },
  );

  return data.likeUser;
};

export const rateScore = async (input: {
  userId: string;
  score: number;
}): Promise<ScoreSummary> => {
  const data = await graphQLRequest<{ rateScore: ScoreSummary }>(
    gql`
      mutation RateScore($input: RateScoreInput!) {
        rateScore(input: $input) {
          userId
          averageScore
          scoreCount
        }
      }
    `,
    { input },
  );

  return data.rateScore;
};

export const listMessages = async (
  roomId: string,
  input: { first?: number; after?: string | null } = {},
): Promise<Message[]> => {
  const data = await graphQLRequest<{ chatMessages: Omit<Message, "status" | "mine">[] }>(
    gql`
      query ChatMessages($input: ChatMessagesInput!) {
        chatMessages(input: $input) {
          id
          roomId
          text
          createdAt
        }
      }
    `,
    { input: { roomId, first: input.first ?? 50, after: input.after ?? null } },
  );

  return data.chatMessages.map((message) => ({ ...message, status: "sent", mine: false }));
};

export const sendMessage = async (input: {
  roomId: string;
  text: string;
  idempotencyKey: string;
}): Promise<Message> => {
  const data = await graphQLRequest<{ sendChatMessage: Omit<Message, "status" | "mine"> }>(
    gql`
      mutation SendChatMessage($input: SendChatMessageInput!) {
        sendChatMessage(input: $input) {
          id
          roomId
          text
          createdAt
        }
      }
    `,
    { input },
  );

  return { ...data.sendChatMessage, status: "sent", mine: true };
};

export const editMessage = async (input: { messageId: string; text: string }): Promise<Message> => {
  const data = await graphQLRequest<{ editChatMessage: Omit<Message, "status" | "mine"> }>(
    gql`
      mutation EditChatMessage($input: EditChatMessageInput!) {
        editChatMessage(input: $input) {
          id
          roomId
          text
          createdAt
        }
      }
    `,
    { input },
  );

  return { ...data.editChatMessage, status: "sent", mine: true };
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  const data = await graphQLRequest<{ deleteChatMessage: boolean }>(
    gql`
      mutation DeleteChatMessage($messageId: String!) {
        deleteChatMessage(messageId: $messageId)
      }
    `,
    { messageId },
  );

  return data.deleteChatMessage;
};

export const markRoomRead = async (roomId: string): Promise<boolean> => {
  const data = await graphQLRequest<{ markChatRoomRead: boolean }>(
    gql`
      mutation MarkChatRoomRead($input: MarkRoomReadInput!) {
        markChatRoomRead(input: $input)
      }
    `,
    { input: { roomId } },
  );

  return data.markChatRoomRead;
};

export const setTyping = async (input: { roomId: string; typing: boolean }): Promise<boolean> => {
  const data = await graphQLRequest<{ setChatTyping: boolean }>(
    gql`
      mutation SetChatTyping($input: SetTypingInput!) {
        setChatTyping(input: $input)
      }
    `,
    { input },
  );

  return data.setChatTyping;
};

export const blockUser = async (userId: string): Promise<boolean> => {
  const data = await graphQLRequest<{ blockUser: boolean }>(
    gql`
      mutation BlockUser($userId: String!) {
        blockUser(input: { userId: $userId })
      }
    `,
    { userId },
  );

  return data.blockUser;
};

export const reportMessage = async (input: {
  messageId: string;
  reason: string;
}): Promise<boolean> => {
  const data = await graphQLRequest<{ reportChatMessage: boolean }>(
    gql`
      mutation ReportChatMessage($input: ReportMessageInput!) {
        reportChatMessage(input: $input)
      }
    `,
    { input },
  );

  return data.reportChatMessage;
};

export const createUpload = async (input: {
  filename: string;
  contentType: string;
}): Promise<Upload> => {
  const data = await graphQLRequest<{ createUpload: Upload }>(
    gql`
      mutation CreateUpload($input: CreateUploadInput!) {
        createUpload(input: $input) {
          id
          putUrl
        }
      }
    `,
    { input },
  );

  return data.createUpload;
};

export const uploadFileToSignedUrl = async (input: {
  putUrl: string;
  contentType: string;
  body: Blob | ArrayBuffer | string;
}) => {
  const response = await uploadFetch(input.putUrl, {
    method: "PUT",
    headers: { "content-type": input.contentType },
    body: input.body,
  });

  if (!response.ok) {
    throw new Error("UPLOAD_PUT_FAILED");
  }
};

export const subscribeToMessageCreated = (input: {
  roomId: string;
  onMessage: (message: Message) => void;
  onError?: (error: unknown) => void;
}) => {
  const client = createGraphQLSubscriptionClient();

  return client.subscribe(
    {
      query: `
        subscription MessageCreated($roomId: ID!) {
          messageCreated(roomId: $roomId) {
            id
            roomId
            text
            createdAt
          }
        }
      `,
      variables: { roomId: input.roomId },
    },
    {
      next(value) {
        const message = value.data?.messageCreated as Omit<Message, "status" | "mine"> | undefined;
        if (message) {
          input.onMessage({ ...message, status: "sent", mine: false });
        }
      },
      error: input.onError ?? (() => undefined),
      complete: () => undefined,
    },
  );
};

export const subscribeToMessageUpdated = (input: {
  roomId: string;
  onMessage: (message: Message) => void;
  onError?: (error: unknown) => void;
}) => {
  const client = createGraphQLSubscriptionClient();

  return client.subscribe(
    {
      query: `
        subscription MessageUpdated($roomId: ID!) {
          messageUpdated(roomId: $roomId) {
            id
            roomId
            text
            createdAt
          }
        }
      `,
      variables: { roomId: input.roomId },
    },
    {
      next(value) {
        const message = value.data?.messageUpdated as Omit<Message, "status" | "mine"> | undefined;
        if (message) {
          input.onMessage({ ...message, status: "sent", mine: false });
        }
      },
      error: input.onError ?? (() => undefined),
      complete: () => undefined,
    },
  );
};

export const subscribeToMessageDeleted = (input: {
  roomId: string;
  onMessageId: (messageId: string) => void;
  onError?: (error: unknown) => void;
}) => {
  const client = createGraphQLSubscriptionClient();

  return client.subscribe(
    {
      query: `
        subscription MessageDeleted($roomId: ID!) {
          messageDeleted(roomId: $roomId)
        }
      `,
      variables: { roomId: input.roomId },
    },
    {
      next(value) {
        const messageId = value.data?.messageDeleted;
        if (typeof messageId === "string") {
          input.onMessageId(messageId);
        }
      },
      error: input.onError ?? (() => undefined),
      complete: () => undefined,
    },
  );
};

export const subscribeToTypingChanged = (input: {
  roomId: string;
  onTyping: (typing: boolean) => void;
  onError?: (error: unknown) => void;
}) => {
  const client = createGraphQLSubscriptionClient();

  return client.subscribe(
    {
      query: `
        subscription TypingChanged($roomId: ID!) {
          typingChanged(roomId: $roomId)
        }
      `,
      variables: { roomId: input.roomId },
    },
    {
      next(value) {
        const typing = value.data?.typingChanged;
        if (typeof typing === "boolean") {
          input.onTyping(typing);
        }
      },
      error: input.onError ?? (() => undefined),
      complete: () => undefined,
    },
  );
};

export const subscribeToReadReceiptUpdated = (input: {
  roomId: string;
  onRead: (read: boolean) => void;
  onError?: (error: unknown) => void;
}) => {
  const client = createGraphQLSubscriptionClient();

  return client.subscribe(
    {
      query: `
        subscription ReadReceiptUpdated($roomId: ID!) {
          readReceiptUpdated(roomId: $roomId)
        }
      `,
      variables: { roomId: input.roomId },
    },
    {
      next(value) {
        const read = value.data?.readReceiptUpdated;
        if (typeof read === "boolean") {
          input.onRead(read);
        }
      },
      error: input.onError ?? (() => undefined),
      complete: () => undefined,
    },
  );
};

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
  ProfileRatingSummary,
  Room,
  SubscriptionPlan,
  Upload,
} from "./types";

type Fetcher = typeof fetch;

let uploadFetch: Fetcher = fetch;

export const setUploadFetcher = (fetcher: Fetcher) => {
  uploadFetch = fetcher;
};

export const listRooms = async (): Promise<Room[]> => {
  const data = await graphQLRequest<{ rooms: Room[] }>(gql`
    query Rooms {
      rooms {
        id
        name
        lastMessage
      }
    }
  `);

  return data.rooms;
};

export const listCommunityPosts = async (): Promise<CommunityPost[]> => {
  const data = await graphQLRequest<{ communityPosts: CommunityPost[] }>(gql`
    query CommunityPosts {
      communityPosts {
        id
        anonymousNickname
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
      mutation CreateCommunityPost($title: String!, $body: String!) {
        createCommunityPost(title: $title, body: $body) {
          id
          anonymousNickname
          title
          body
          commentCount
          createdAt
        }
      }
    `,
    input,
  );

  return data.createCommunityPost;
};

export const createCommunityComment = async (input: {
  postId: string;
  body: string;
}): Promise<CommunityComment> => {
  const data = await graphQLRequest<{ createCommunityComment: CommunityComment }>(
    gql`
      mutation CreateCommunityComment($postId: ID!, $body: String!) {
        createCommunityComment(postId: $postId, body: $body) {
          id
          postId
          anonymousNickname
          body
          createdAt
        }
      }
    `,
    input,
  );

  return data.createCommunityComment;
};

export const reportCommunityPost = async (input: {
  postId: string;
  reason: string;
}): Promise<boolean> => {
  const data = await graphQLRequest<{ reportCommunityPost: boolean }>(
    gql`
      mutation ReportCommunityPost($postId: ID!, $reason: String!) {
        reportCommunityPost(postId: $postId, reason: $reason)
      }
    `,
    input,
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
  const data = await graphQLRequest<{ mySubscription: CurrentSubscription }>(gql`
    query MySubscription {
      mySubscription {
        planId
      }
    }
  `);

  return data.mySubscription;
};

export const getUnreadMessageSummary = async (input: {
  planId: string;
  unreadTexts: string[];
  enabled: boolean;
}): Promise<AiSummaryPreview> => {
  const data = await graphQLRequest<{ unreadMessageSummary: AiSummaryPreview }>(
    gql`
      query UnreadMessageSummary($planId: String!, $unreadTexts: [String!]!, $enabled: Boolean!) {
        unreadMessageSummary(planId: $planId, unreadTexts: $unreadTexts, enabled: $enabled) {
          available
          reason
          sourceText
          summary
        }
      }
    `,
    input,
  );

  return data.unreadMessageSummary;
};

export const listMatchCandidates = async (): Promise<MatchCandidate[]> => {
  const data = await graphQLRequest<{ matchCandidates: MatchCandidate[] }>(gql`
    query MatchCandidates {
      matchCandidates {
        id
        nickname
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
        nickname
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
        nickname
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
      mutation LikeUser($userId: ID!) {
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

export const rateProfile = async (input: {
  userId: string;
  score: number;
}): Promise<ProfileRatingSummary> => {
  const data = await graphQLRequest<{ rateProfile: ProfileRatingSummary }>(
    gql`
      mutation RateProfile($userId: ID!, $score: Int!) {
        rateProfile(userId: $userId, score: $score) {
          userId
          averageScore
          ratingCount
        }
      }
    `,
    input,
  );

  return data.rateProfile;
};

export const listMessages = async (
  roomId: string,
  input: { first?: number; after?: string | null } = {},
): Promise<Message[]> => {
  const data = await graphQLRequest<{ messages: Omit<Message, "status" | "mine">[] }>(
    gql`
      query Messages($roomId: ID!, $first: Int, $after: String) {
        messages(roomId: $roomId, first: $first, after: $after) {
          id
          roomId
          text
          createdAt
        }
      }
    `,
    { roomId, first: input.first ?? 50, after: input.after ?? null },
  );

  return data.messages.map((message) => ({ ...message, status: "sent", mine: false }));
};

export const sendMessage = async (input: {
  roomId: string;
  text: string;
  idempotencyKey: string;
}): Promise<Message> => {
  const data = await graphQLRequest<{ sendMessage: Omit<Message, "status" | "mine"> }>(
    gql`
      mutation SendMessage($roomId: ID!, $text: String!, $idempotencyKey: String) {
        sendMessage(roomId: $roomId, text: $text, idempotencyKey: $idempotencyKey) {
          id
          roomId
          text
          createdAt
        }
      }
    `,
    input,
  );

  return { ...data.sendMessage, status: "sent", mine: true };
};

export const editMessage = async (input: { messageId: string; text: string }): Promise<Message> => {
  const data = await graphQLRequest<{ editMessage: Omit<Message, "status" | "mine"> }>(
    gql`
      mutation EditMessage($messageId: ID!, $text: String!) {
        editMessage(messageId: $messageId, text: $text) {
          id
          roomId
          text
          createdAt
        }
      }
    `,
    input,
  );

  return { ...data.editMessage, status: "sent", mine: true };
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  const data = await graphQLRequest<{ deleteMessage: boolean }>(
    gql`
      mutation DeleteMessage($messageId: ID!) {
        deleteMessage(messageId: $messageId)
      }
    `,
    { messageId },
  );

  return data.deleteMessage;
};

export const markRoomRead = async (roomId: string): Promise<boolean> => {
  const data = await graphQLRequest<{ markRoomRead: boolean }>(
    gql`
      mutation MarkRoomRead($roomId: ID!) {
        markRoomRead(roomId: $roomId)
      }
    `,
    { roomId },
  );

  return data.markRoomRead;
};

export const setTyping = async (input: { roomId: string; typing: boolean }): Promise<boolean> => {
  const data = await graphQLRequest<{ setTyping: boolean }>(
    gql`
      mutation SetTyping($roomId: ID!, $typing: Boolean!) {
        setTyping(roomId: $roomId, typing: $typing)
      }
    `,
    input,
  );

  return data.setTyping;
};

export const blockUser = async (userId: string): Promise<boolean> => {
  const data = await graphQLRequest<{ blockUser: boolean }>(
    gql`
      mutation BlockUser($userId: ID!) {
        blockUser(userId: $userId)
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
  const data = await graphQLRequest<{ reportMessage: boolean }>(
    gql`
      mutation ReportMessage($messageId: ID!, $reason: String!) {
        reportMessage(messageId: $messageId, reason: $reason)
      }
    `,
    input,
  );

  return data.reportMessage;
};

export const createUpload = async (input: {
  filename: string;
  contentType: string;
}): Promise<Upload> => {
  const data = await graphQLRequest<{ createUpload: Upload }>(
    gql`
      mutation CreateUpload($filename: String!, $contentType: String!) {
        createUpload(filename: $filename, contentType: $contentType) {
          id
          putUrl
        }
      }
    `,
    input,
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

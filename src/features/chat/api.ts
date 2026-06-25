import { gql } from "graphql-request";
import { createGraphQLSubscriptionClient, graphQLRequest } from "../../shared/graphql/client";
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

export function setUploadFetcher(fetcher: Fetcher) {
  uploadFetch = fetcher;
}

export async function listRooms(): Promise<Room[]> {
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
}

export async function listCommunityPosts(): Promise<CommunityPost[]> {
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
}

export async function createCommunityPost(input: {
  title: string;
  body: string;
}): Promise<CommunityPost> {
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
}

export async function createCommunityComment(input: {
  postId: string;
  body: string;
}): Promise<CommunityComment> {
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
}

export async function reportCommunityPost(input: {
  postId: string;
  reason: string;
}): Promise<boolean> {
  const data = await graphQLRequest<{ reportCommunityPost: boolean }>(
    gql`
      mutation ReportCommunityPost($postId: ID!, $reason: String!) {
        reportCommunityPost(postId: $postId, reason: $reason)
      }
    `,
    input,
  );

  return data.reportCommunityPost;
}

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
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
}

export async function getMySubscription(): Promise<CurrentSubscription> {
  const data = await graphQLRequest<{ mySubscription: CurrentSubscription }>(gql`
    query MySubscription {
      mySubscription {
        planId
      }
    }
  `);

  return data.mySubscription;
}

export async function getUnreadMessageSummary(input: {
  planId: string;
  unreadTexts: string[];
  enabled: boolean;
}): Promise<AiSummaryPreview> {
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
}

export async function listMatchCandidates(): Promise<MatchCandidate[]> {
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
}

export async function listBlackMatchCandidates(): Promise<MatchCandidate[]> {
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
}

export async function listLikedMeCandidates(): Promise<MatchCandidate[]> {
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
}

export async function likeUser(userId: string): Promise<LikeUserResult> {
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
}

export async function rateProfile(input: {
  userId: string;
  score: number;
}): Promise<ProfileRatingSummary> {
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
}

export async function listMessages(
  roomId: string,
  input: { first?: number; after?: string | null } = {},
): Promise<Message[]> {
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
}

export async function sendMessage(input: {
  roomId: string;
  text: string;
  idempotencyKey: string;
}): Promise<Message> {
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
}

export async function editMessage(input: { messageId: string; text: string }): Promise<Message> {
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
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  const data = await graphQLRequest<{ deleteMessage: boolean }>(
    gql`
      mutation DeleteMessage($messageId: ID!) {
        deleteMessage(messageId: $messageId)
      }
    `,
    { messageId },
  );

  return data.deleteMessage;
}

export async function markRoomRead(roomId: string): Promise<boolean> {
  const data = await graphQLRequest<{ markRoomRead: boolean }>(
    gql`
      mutation MarkRoomRead($roomId: ID!) {
        markRoomRead(roomId: $roomId)
      }
    `,
    { roomId },
  );

  return data.markRoomRead;
}

export async function setTyping(input: { roomId: string; typing: boolean }): Promise<boolean> {
  const data = await graphQLRequest<{ setTyping: boolean }>(
    gql`
      mutation SetTyping($roomId: ID!, $typing: Boolean!) {
        setTyping(roomId: $roomId, typing: $typing)
      }
    `,
    input,
  );

  return data.setTyping;
}

export async function blockUser(userId: string): Promise<boolean> {
  const data = await graphQLRequest<{ blockUser: boolean }>(
    gql`
      mutation BlockUser($userId: ID!) {
        blockUser(userId: $userId)
      }
    `,
    { userId },
  );

  return data.blockUser;
}

export async function reportMessage(input: {
  messageId: string;
  reason: string;
}): Promise<boolean> {
  const data = await graphQLRequest<{ reportMessage: boolean }>(
    gql`
      mutation ReportMessage($messageId: ID!, $reason: String!) {
        reportMessage(messageId: $messageId, reason: $reason)
      }
    `,
    input,
  );

  return data.reportMessage;
}

export async function createUpload(input: {
  filename: string;
  contentType: string;
}): Promise<Upload> {
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
}

export async function uploadFileToSignedUrl(input: {
  putUrl: string;
  contentType: string;
  body: Blob | ArrayBuffer | string;
}) {
  const response = await uploadFetch(input.putUrl, {
    method: "PUT",
    headers: { "content-type": input.contentType },
    body: input.body,
  });

  if (!response.ok) {
    throw new Error("UPLOAD_PUT_FAILED");
  }
}

export function subscribeToMessageCreated(input: {
  roomId: string;
  onMessage: (message: Message) => void;
  onError?: (error: unknown) => void;
}) {
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
}

export function subscribeToMessageUpdated(input: {
  roomId: string;
  onMessage: (message: Message) => void;
  onError?: (error: unknown) => void;
}) {
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
}

export function subscribeToMessageDeleted(input: {
  roomId: string;
  onMessageId: (messageId: string) => void;
  onError?: (error: unknown) => void;
}) {
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
}

export function subscribeToTypingChanged(input: {
  roomId: string;
  onTyping: (typing: boolean) => void;
  onError?: (error: unknown) => void;
}) {
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
}

export function subscribeToReadReceiptUpdated(input: {
  roomId: string;
  onRead: (read: boolean) => void;
  onError?: (error: unknown) => void;
}) {
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
}

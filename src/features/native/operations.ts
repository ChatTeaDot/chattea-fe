import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query NativeMe {
    me {
      id
      email
      phone
      userName
      gender
      intro
      birthDate
      region
      interestedGender
      profileCompleted
      photos {
        id
        url
        position
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateNativeProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      email
      phone
      userName
      gender
      intro
      birthDate
      region
      interestedGender
      profileCompleted
      photos {
        id
        url
        position
      }
    }
  }
`;

export const MATCH_CANDIDATES_QUERY = gql`
  query NativeMatchCandidates {
    matchCandidates {
      id
      userName
      gender
      age
      region
      intro
      likedByMe
      planId
      blackRecommended
      boostActive
      photos {
        url
        position
      }
    }
  }
`;

export const LIKED_ME_CANDIDATES_QUERY = gql`
  query NativeLikedMeCandidates {
    likedMeCandidates {
      id
      userName
      gender
      age
      region
      intro
      likedByMe
      planId
      blackRecommended
      boostActive
      photos {
        url
        position
      }
    }
  }
`;

export const LIKE_USER_MUTATION = gql`
  mutation NativeLikeUser($userId: String!) {
    likeUser(userId: $userId) {
      matched
      roomId
      undoAvailable
    }
  }
`;

export const SKIP_CANDIDATE_MUTATION = gql`
  mutation SkipNativeCandidate($userId: String!) {
    skipMatchCandidate(userId: $userId)
  }
`;

export const SUPERLIKE_MUTATION = gql`
  mutation NativeSuperLike($userId: String!) {
    superLikeUser(userId: $userId) {
      matched
      roomId
      undoAvailable
    }
  }
`;

export const UNDO_MATCH_ACTION_MUTATION = gql`
  mutation UndoNativeMatchAction {
    undoLastMatchAction {
      reverted
      targetUserId
    }
  }
`;

export const ACTIVATE_BOOST_MUTATION = gql`
  mutation ActivateNativeBoost {
    activateBoost {
      activeUntil
      remainingBoostCredits
    }
  }
`;

export const COMMUNITY_POSTS_QUERY = gql`
  query NativeCommunityPosts {
    communityPosts {
      id
      authorName
      title
      body
      commentCount
      createdAt
    }
  }
`;

export const COMMUNITY_COMMENTS_QUERY = gql`
  query NativeCommunityComments($postId: String!) {
    communityComments(postId: $postId) {
      id
      postId
      authorName
      body
      createdAt
    }
  }
`;

export const CREATE_COMMUNITY_POST_MUTATION = gql`
  mutation NativeCreateCommunityPost($input: CreateCommunityPostInput!) {
    createCommunityPost(input: $input) {
      id
      authorName
      title
      body
      commentCount
      createdAt
    }
  }
`;

export const CREATE_COMMUNITY_COMMENT_MUTATION = gql`
  mutation NativeCreateCommunityComment($input: CreateCommunityCommentInput!) {
    createCommunityComment(input: $input) {
      id
      postId
      authorName
      body
      createdAt
    }
  }
`;

export const REPORT_COMMUNITY_POST_MUTATION = gql`
  mutation NativeReportCommunityPost($input: ReportCommunityPostInput!) {
    reportCommunityPost(input: $input)
  }
`;

export const REPORT_COMMUNITY_COMMENT_MUTATION = gql`
  mutation NativeReportCommunityComment($input: ReportCommunityCommentInput!) {
    reportCommunityComment(input: $input)
  }
`;

export const CHAT_ROOMS_QUERY = gql`
  query NativeChatRooms {
    chatRooms {
      id
      name
      lastMessage
      unreadCount
    }
  }
`;

export const CHAT_MESSAGES_QUERY = gql`
  query NativeChatMessages($input: ChatMessagesInput!) {
    chatMessages(input: $input) {
      id
      roomId
      senderUserId
      text
      idempotencyKey
      createdAt
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation NativeSendMessage($input: SendChatMessageInput!) {
    sendChatMessage(input: $input) {
      id
      roomId
      senderUserId
      text
      idempotencyKey
      createdAt
    }
  }
`;

export const MARK_ROOM_READ_MUTATION = gql`
  mutation NativeMarkRoomRead($input: MarkRoomReadInput!) {
    markChatRoomRead(input: $input)
  }
`;

export const REPORT_MESSAGE_MUTATION = gql`
  mutation NativeReportMessage($input: ReportMessageInput!) {
    reportChatMessage(input: $input)
  }
`;

export const NOTIFICATIONS_QUERY = gql`
  query NativeNotifications {
    notifications {
      id
      type
      title
      body
      route
      readAt
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation NativeMarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId)
  }
`;

export const REGISTER_PUSH_TOKEN_MUTATION = gql`
  mutation NativeRegisterPushToken($input: RegisterPushTokenInput!) {
    registerPushToken(input: $input)
  }
`;

export const BILLING_PRODUCTS_QUERY = gql`
  query NativeBillingProducts {
    billingProducts {
      id
      kind
      name
    }
  }
`;

export const CONSUMABLE_BALANCE_QUERY = gql`
  query NativeConsumableBalance {
    consumableBalance {
      superLikeCredits
      boostCredits
    }
  }
`;

export const REQUEST_ACCOUNT_DELETION_MUTATION = gql`
  mutation NativeRequestAccountDeletion {
    requestAccountDeletion {
      hidden
      scheduledFor
    }
  }
`;

export const CREATE_UPLOAD_MUTATION = gql`
  mutation NativeCreateUpload($input: CreateUploadInput!) {
    createUpload(input: $input) {
      id
      putUrl
      publicUrl
    }
  }
`;

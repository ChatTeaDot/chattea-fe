import { gql } from "@apollo/client";

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

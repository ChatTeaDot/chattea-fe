import { useMutation, useQuery } from "@apollo/client/react";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useRouteParam } from "@/shared/hooks";
import { showActionError } from "@/shared/lib";

import {
  type CommentsData,
  COMMUNITY_COMMENTS_QUERY,
  COMMUNITY_POSTS_QUERY,
  type CommunityComment,
  type CommunityPost,
  CREATE_COMMUNITY_COMMENT_MUTATION,
  CREATE_COMMUNITY_POST_MUTATION,
  type PostsData,
  REPORT_COMMUNITY_COMMENT_MUTATION,
  REPORT_COMMUNITY_POST_MUTATION,
} from "./api";
import { WEBVIEW_TRACE_SETTLE_MS } from "./constants";
import {
  createCommunityCommentDraft,
  createCommunityPostDraft,
  toCreateCommunityCommentVariables,
  toCreateCommunityPostVariables,
} from "./utils/idempotency";
import {
  createWebviewTrace,
  parseVitalsMessage,
  type WebviewTrace,
} from "./utils/webview-trace";

export const useCommunityPosts = () => {
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  const openPost = useCallback((id: string) => router.push(`/community/${id}`), []);

  return { posts, openPost };
};

export const useCommunityPost = () => {
  const postId = useRouteParam("post-id");
  const posts = useQuery<PostsData>(COMMUNITY_POSTS_QUERY);
  const comments = useQuery<CommentsData>(COMMUNITY_COMMENTS_QUERY, {
    skip: !postId,
    variables: { postId },
  });
  const [createComment, commentState] = useMutation<
    { createCommunityComment: CommunityComment },
    ReturnType<typeof toCreateCommunityCommentVariables>
  >(CREATE_COMMUNITY_COMMENT_MUTATION);
  const [reportComment] = useMutation<{ reportCommunityComment: boolean }>(
    REPORT_COMMUNITY_COMMENT_MUTATION,
  );
  const [report] = useMutation<{ reportCommunityPost: boolean }>(REPORT_COMMUNITY_POST_MUTATION);
  const [draft, setDraft] = useState(createCommunityCommentDraft);
  const post = posts.data?.communityPosts.find((item) => item.id === postId);

  const submitComment = async () => {
    if (!postId) return;
    const variables = toCreateCommunityCommentVariables(postId, draft);
    if (!variables.input.body) return;
    try {
      await createComment({ variables });
      setDraft((current) =>
        current.idempotencyKey === draft.idempotencyKey ? createCommunityCommentDraft() : current,
      );
      void comments.refetch();
      void posts.refetch();
    } catch {
      showActionError();
    }
  };

  const reportPost = useCallback(() => {
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
  }, [postId, report]);
  const reportCommentById = useCallback(
    (commentId: string) => {
      Alert.alert("이 댓글을 신고할까요?", "운영팀이 내용을 확인해요.", [
        { text: "취소", style: "cancel" },
        {
          text: "신고하기",
          style: "destructive",
          onPress: () => {
            void reportComment({
              variables: { input: { commentId, reason: "사용자 신고" } },
            })
              .then(() => Alert.alert("신고를 접수했어요", "확인 후 필요한 조치를 할게요."))
              .catch(showActionError);
          },
        },
      ]);
    },
    [reportComment],
  );

  return {
    posts,
    comments,
    post,
    draft,
    setDraft,
    submitComment,
    commentState,
    reportPost,
    reportCommentById,
  };
};

const webviewTraceTags = {
  env: process.env.EXPO_PUBLIC_SERVICE_ENV ?? "development",
  release: process.env.EXPO_PUBLIC_SERVICE_VERSION ?? "dev",
  screen: "community",
};

export const useCommunityWebviewTrace = () => {
  const traceRef = useRef<WebviewTrace | null>(null);
  const loadedOnceRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getTrace = useCallback(() => {
    if (!traceRef.current) {
      traceRef.current = createWebviewTrace(webviewTraceTags);
      traceRef.current.mark("tab-focus");
    }
    return traceRef.current;
  }, []);

  const scheduleClose = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(
      () => traceRef.current?.close(),
      WEBVIEW_TRACE_SETTLE_MS,
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      traceRef.current?.close();
      traceRef.current = createWebviewTrace(webviewTraceTags);
      traceRef.current.mark("tab-focus");
      if (loadedOnceRef.current) {
        traceRef.current.mark("webview-ready");
        scheduleClose();
      }
      return () => traceRef.current?.close();
    }, [scheduleClose]),
  );

  useEffect(() => {
    getTrace().mark("screen-mount");
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [getTrace]);

  const onMount = useCallback(() => {
    getTrace().mark("webview-mount");
  }, [getTrace]);

  const onLoadStart = useCallback(() => {
    getTrace().mark("load-start");
  }, [getTrace]);

  const onLoadEnd = useCallback(() => {
    getTrace().mark("load-end");
    loadedOnceRef.current = true;
    scheduleClose();
  }, [getTrace, scheduleClose]);

  const onMessage = useCallback(
    (data: string) => {
      const vital = parseVitalsMessage(data);
      if (!vital) return;
      const trace = getTrace();
      trace.mark(`web:${vital.name}`);
      if (vital.name === "LCP") trace.close();
    },
    [getTrace],
  );

  return { onLoadEnd, onLoadStart, onMessage, onMount };
};

export const useCommunityPostDraft = () => {
  const [draft, setDraft] = useState(createCommunityPostDraft);
  const [createPost, state] = useMutation<
    { createCommunityPost: CommunityPost },
    ReturnType<typeof toCreateCommunityPostVariables>
  >(CREATE_COMMUNITY_POST_MUTATION);
  const submit = async () => {
    const variables = toCreateCommunityPostVariables(draft);
    if (!variables.input.title || !variables.input.body) return;
    try {
      await createPost({
        variables,
        refetchQueries: [COMMUNITY_POSTS_QUERY],
      });
      setDraft((current) =>
        current.idempotencyKey === draft.idempotencyKey ? createCommunityPostDraft() : current,
      );
      router.back();
    } catch {
      showActionError();
    }
  };

  return { draft, setDraft, submit, state };
};

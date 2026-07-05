import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCommunityComment,
  createCommunityPost,
  getCommunityProfile,
  listCommunityPosts,
  reportCommunityPost,
  updateCommunityProfile,
} from "./api";

export const useCommunityPosts = () => {
  return useQuery({ queryKey: ["community-posts"], queryFn: listCommunityPosts });
};

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

export const useCreateCommunityComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

export const useReportCommunityPost = () => {
  return useMutation({ mutationFn: reportCommunityPost });
};

export const useCommunityProfile = () => {
  return useQuery({ queryKey: ["community-profile"], queryFn: getCommunityProfile });
};

export const useUpdateCommunityProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCommunityProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-profile"] });
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

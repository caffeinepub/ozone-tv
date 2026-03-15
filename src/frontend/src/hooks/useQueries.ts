import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, Video } from "../backend";
import { MOCK_VIDEOS } from "../data/mockVideos";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return MOCK_VIDEOS;
      const videos = await actor.getAllVideos();
      return videos.length > 0 ? videos : MOCK_VIDEOS;
    },
    enabled: !isFetching,
    staleTime: 30000,
  });
}

export function useVideosByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "category", category],
    queryFn: async () => {
      if (!actor) return MOCK_VIDEOS.filter((v) => v.category === category);
      const videos = await actor.filterByCategory(category);
      return videos.length > 0
        ? videos
        : MOCK_VIDEOS.filter((v) => v.category === category);
    },
    enabled: !isFetching,
    staleTime: 30000,
  });
}

export function useSearchVideos(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "search", keyword],
    queryFn: async () => {
      if (!keyword.trim()) return [];
      if (!actor)
        return MOCK_VIDEOS.filter((v) =>
          v.title.toLowerCase().includes(keyword.toLowerCase()),
        );
      return actor.searchVideos(keyword);
    },
    enabled: !isFetching && keyword.length > 0,
  });
}

export function useVideo(videoId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video | null>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      if (!actor) return MOCK_VIDEOS.find((v) => v.id === videoId) ?? null;
      return actor.viewVideo(videoId);
    },
    enabled: !isFetching && !!videoId,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !isFetching && !!identity,
  });
}

export function useIsPremium() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isPremium", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isPremium();
    },
    enabled: !isFetching && !!identity,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserProfile | null>({
    queryKey: ["profile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !isFetching && !!identity,
  });
}

export function useFavorites() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<string[]>({
    queryKey: ["favorites", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getFavorites();
    },
    enabled: !isFetching && !!identity,
  });
}

export function useWatchHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<string[]>({
    queryKey: ["watchHistory", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getWatchHistory();
    },
    enabled: !isFetching && !!identity,
  });
}

export function useVideoAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, bigint][]>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideoAnalytics();
    },
    enabled: !isFetching,
  });
}

export function useTotalUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalUsers();
    },
    enabled: !isFetching,
  });
}

export function useSubscriberCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["subscriberCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getSubscriberCount();
    },
    enabled: !isFetching,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !isFetching,
  });
}

export function useAddVideoMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: Video) => {
      if (!actor) throw new Error("Not connected");
      await actor.addVideo(video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideoMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: Video) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateVideo(video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideoMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useAddFavoriteMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.addFavorite(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useRemoveFavoriteMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.removeFavorite(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

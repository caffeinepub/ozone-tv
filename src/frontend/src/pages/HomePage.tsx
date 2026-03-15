import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import HeroSection from "../components/HeroSection";
import VideoRow from "../components/VideoRow";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllVideos, useIsPremium } from "../hooks/useQueries";

const CATEGORIES = ["Movies", "Short Films", "Music Videos", "Children"];
const CATEGORY_LINKS: Record<string, string> = {
  Movies: "/category/Movies",
  "Short Films": "/category/Short Films",
  "Music Videos": "/category/Music Videos",
  Children: "/category/Children",
};
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

export default function HomePage() {
  const { data: videos = [], isLoading } = useAllVideos();
  const { data: isPremium } = useIsPremium();
  const { identity } = useInternetIdentity();

  const isSubscribed = !!identity && !!isPremium;

  const featuredVideo = useMemo(() => {
    const premium = videos.find((v) => v.isPremium);
    return premium ?? videos[0] ?? null;
  }, [videos]);

  const trending = useMemo(
    () => [...videos].sort((a, b) => Number(b.views - a.views)).slice(0, 8),
    [videos],
  );

  const recent = useMemo(
    () =>
      [...videos]
        .sort((a, b) => Number(b.uploadedAt - a.uploadedAt))
        .slice(0, 8),
    [videos],
  );

  const byCategory = useMemo(() => {
    const map: Record<string, typeof videos> = {};
    for (const cat of CATEGORIES) {
      map[cat] = videos.filter((v) => v.category === cat);
    }
    return map;
  }, [videos]);

  if (isLoading) {
    return (
      <div className="pt-16" data-ocid="home.loading_state">
        <Skeleton className="w-full h-[56vw] max-h-[640px] min-h-[340px] shimmer" />
        <div className="mt-8 px-4 md:px-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex gap-3">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="w-56 h-32 rounded-lg shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {featuredVideo && (
        <HeroSection video={featuredVideo} isSubscribed={isSubscribed} />
      )}

      <div className="mt-8">
        <VideoRow
          title="🔥 Trending Now"
          videos={trending}
          size="md"
          isSubscribed={isSubscribed}
        />
        <VideoRow
          title="🆕 Recently Uploaded"
          videos={recent}
          size="md"
          isSubscribed={isSubscribed}
        />

        {CATEGORIES.map(
          (cat) =>
            byCategory[cat]?.length > 0 && (
              <VideoRow
                key={cat}
                title={
                  cat === "Children"
                    ? "👶 Kids' Corner"
                    : cat === "Music Videos"
                      ? "🎵 Music Videos"
                      : cat === "Short Films"
                        ? "🎬 Short Films"
                        : "🎥 Movies"
                }
                videos={byCategory[cat]}
                categoryLink={CATEGORY_LINKS[cat]}
                size="md"
                isSubscribed={isSubscribed}
              />
            ),
        )}
      </div>
    </div>
  );
}

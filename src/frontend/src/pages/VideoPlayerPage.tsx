import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Crown, Eye, Heart, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import LoginPrompt from "../components/LoginPrompt";
import VideoCard from "../components/VideoCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFavoriteMutation,
  useAllVideos,
  useFavorites,
  useIsPremium,
  useRemoveFavoriteMutation,
  useVideo,
} from "../hooks/useQueries";

function getEmbedUrl(url: string): {
  type: "youtube" | "vimeo" | "video";
  src: string;
} {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    const id = match?.[1] ?? "";
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
    };
  }
  if (url.includes("vimeo.com")) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match?.[1] ?? "";
    return {
      type: "vimeo",
      src: `https://player.vimeo.com/video/${id}?autoplay=1`,
    };
  }
  return { type: "video", src: url };
}

function formatViews(views: bigint): string {
  const n = Number(views);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M views`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K views`;
  return `${n} views`;
}

export default function VideoPlayerPage() {
  const { id } = useParams({ from: "/video/$id" });
  const { data: video, isLoading } = useVideo(id);
  const { data: isPremium } = useIsPremium();
  const { data: allVideos = [] } = useAllVideos();
  const { data: favorites = [] } = useFavorites();
  const { identity } = useInternetIdentity();
  const addFavorite = useAddFavoriteMutation();
  const removeFavorite = useRemoveFavoriteMutation();

  const isFavorite = favorites.includes(id);
  const isLoggedIn = !!identity;
  const isSubscribed = isLoggedIn && !!isPremium;

  const related = allVideos
    .filter((v) => v.id !== id && v.category === video?.category)
    .slice(0, 6);

  const handleFavoriteToggle = async () => {
    if (!identity) {
      toast.error("Sign in to save favorites");
      return;
    }
    if (isFavorite) {
      await removeFavorite.mutateAsync(id);
      toast.success("Removed from favorites");
    } else {
      await addFavorite.mutateAsync(id);
      toast.success("Added to favorites");
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 px-4 md:px-8" data-ocid="player.loading_state">
        <Skeleton className="w-full aspect-video rounded-xl shimmer" />
        <Skeleton className="h-8 w-3/4 mt-4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="pt-24 text-center" data-ocid="player.error_state">
        <p className="text-muted-foreground">Video not found.</p>
        <Link to="/">
          <Button variant="ghost" className="mt-4">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const embed = getEmbedUrl(video.videoUrl);

  return (
    <div className="pt-16 pb-16">
      {/* Player area */}
      <div className="bg-black">
        {!isLoggedIn ? (
          // Not logged in — prompt sign in
          <motion.div
            className="w-full aspect-video flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden"
            data-ocid="player.panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Cinematic blur backdrop */}
            {video.thumbnailUrl && (
              <img
                src={video.thumbnailUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-10 blur-lg scale-110"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-glow">
                <Crown className="w-9 h-9 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white">
                Sign In to Watch
              </h3>
              <p className="text-white/60 text-sm md:text-base max-w-sm">
                Create a free account and subscribe to unlock all videos on
                Ozone TV.
              </p>
              <LoginPrompt message="Sign in to watch" />
            </div>
          </motion.div>
        ) : !isSubscribed ? (
          // Logged in but no subscription
          <motion.div
            className="w-full aspect-video flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden"
            data-ocid="player.panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {video.thumbnailUrl && (
              <img
                src={video.thumbnailUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-10 blur-lg scale-110"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-glow">
                <Crown className="w-9 h-9 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white">
                Subscription Required
              </h3>
              <p className="text-white/60 text-sm md:text-base max-w-sm">
                All videos on Ozone TV require an active subscription. Subscribe
                now to watch unlimited content.
              </p>
              <Link to="/subscribe">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow gap-2 px-8 text-base"
                  data-ocid="player.primary_button"
                >
                  <Crown className="w-5 h-5" /> Subscribe Now
                </Button>
              </Link>
              <p className="text-white/30 text-xs">Cancel anytime</p>
            </div>
          </motion.div>
        ) : embed.type === "video" ? (
          // biome-ignore lint/a11y/useMediaCaption: captions not available for user-uploaded content
          <video
            src={embed.src}
            controls
            autoPlay
            className="w-full aspect-video"
            data-ocid="player.canvas_target"
          />
        ) : (
          <iframe
            src={embed.src}
            className="w-full aspect-video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={video.title}
            data-ocid="player.canvas_target"
          />
        )}
      </div>

      {/* Details */}
      <div className="px-4 md:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {video.isPremium && (
                  <Badge className="bg-primary text-primary-foreground border-0 gap-1">
                    <Crown className="w-3 h-3" /> PREMIUM
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground"
                >
                  {video.category}
                </Badge>
              </div>
              <h1 className="font-display font-bold text-xl md:text-3xl text-foreground">
                {video.title}
              </h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Eye className="w-3.5 h-3.5" /> {formatViews(video.views)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 border-border ${
                  isFavorite
                    ? "text-primary border-primary"
                    : "text-muted-foreground"
                }`}
                onClick={handleFavoriteToggle}
                disabled={addFavorite.isPending || removeFavorite.isPending}
                data-ocid="player.toggle"
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border text-muted-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                data-ocid="player.secondary_button"
              >
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
            {video.description}
          </p>
        </motion.div>

        {/* Related videos */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-semibold text-lg mb-4">
              More Like This
            </h2>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
              data-ocid="player.list"
            >
              {related.map((v, i) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  index={i}
                  size="sm"
                  isSubscribed={isSubscribed}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            data-ocid="player.link"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

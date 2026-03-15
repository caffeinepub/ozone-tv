import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { motion } from "motion/react";
import VideoCard from "../components/VideoCard";
import { useVideosByCategory } from "../hooks/useQueries";

const CATEGORY_ICONS: Record<string, string> = {
  Movies: "🎥",
  "Short Films": "🎬",
  "Music Videos": "🎵",
  Children: "👶",
};

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
  "sk-9",
  "sk-10",
];

export default function CategoryPage() {
  const { name } = useParams({ from: "/category/$name" });
  const { data: videos = [], isLoading } = useVideosByCategory(name);

  return (
    <div className="pt-24 pb-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">
          {CATEGORY_ICONS[name] ?? "🎞"} {name}
        </h1>
        <p className="text-muted-foreground mt-1">{videos.length} videos</p>
      </motion.div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          data-ocid="category.loading_state"
        >
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="aspect-video rounded-lg shimmer" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24" data-ocid="category.empty_state">
          <p className="text-muted-foreground text-lg">
            No videos in this category yet.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          data-ocid="category.list"
        >
          {videos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} size="lg" />
          ))}
        </div>
      )}
    </div>
  );
}

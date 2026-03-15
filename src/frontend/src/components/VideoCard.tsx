import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Crown, Eye, Lock, Play } from "lucide-react";
import { motion } from "motion/react";
import type { Video } from "../backend";

interface VideoCardProps {
  video: Video;
  index?: number;
  size?: "sm" | "md" | "lg";
  isSubscribed?: boolean;
}

function formatViews(views: bigint): string {
  const n = Number(views);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function VideoCard({
  video,
  index = 0,
  size = "md",
  isSubscribed,
}: VideoCardProps) {
  const sizeClasses = {
    sm: "w-44 md:w-52",
    md: "w-56 md:w-64",
    lg: "w-64 md:w-80",
  };

  const locked = isSubscribed === false || isSubscribed === undefined;

  return (
    <motion.div
      className={`${sizeClasses[size]} flex-shrink-0`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`video.item.${index + 1}`}
    >
      <Link to="/video/$id" params={{ id: video.id }}>
        <div className="group relative rounded-lg overflow-hidden bg-muted aspect-video cursor-pointer">
          {/* Thumbnail */}
          <img
            src={
              video.thumbnailUrl ||
              `https://picsum.photos/seed/${video.id}/640/360`
            }
            alt={video.title}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              locked ? "brightness-50" : ""
            }`}
            loading="lazy"
          />

          {/* Lock overlay for unsubscribed */}
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-300">
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Lock className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>
          )}

          {/* Hover play overlay (only for subscribed) */}
          {!locked && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-glow">
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {video.isPremium && (
              <Badge className="bg-primary/90 text-primary-foreground text-xs px-1.5 py-0.5 gap-1 border-0">
                <Crown className="w-2.5 h-2.5" /> PREMIUM
              </Badge>
            )}
          </div>

          {/* Views */}
          {!locked && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/70 text-xs">
              <Eye className="w-3 h-3" />
              <span>{formatViews(video.views)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-2 px-0.5">
          <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {video.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locked ? (
              <span className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Subscribe to watch
              </span>
            ) : (
              video.category
            )}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

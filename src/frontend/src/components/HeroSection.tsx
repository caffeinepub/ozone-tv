import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Crown, Info, Play } from "lucide-react";
import { motion } from "motion/react";
import type { Video } from "../backend";

interface HeroSectionProps {
  video: Video;
  isSubscribed?: boolean;
}

export default function HeroSection({ video, isSubscribed }: HeroSectionProps) {
  const locked = isSubscribed === false || isSubscribed === undefined;

  return (
    <div className="relative w-full h-[56vw] max-h-[640px] min-h-[340px] overflow-hidden">
      {/* Background image */}
      <img
        src={
          video.thumbnailUrl ||
          `https://picsum.photos/seed/${video.id}/1280/720`
        }
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 md:px-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 mb-3">
            {video.isPremium && (
              <Badge className="bg-primary text-primary-foreground border-0 gap-1">
                <Crown className="w-3 h-3" /> PREMIUM
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-white/30 text-white/70 text-xs"
            >
              {video.category}
            </Badge>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight mb-3 drop-shadow-lg">
            {video.title}
          </h1>

          <p className="text-white/70 text-sm md:text-base line-clamp-2 mb-6 max-w-lg">
            {video.description}
          </p>

          <div className="flex items-center gap-3">
            {locked ? (
              <Link to="/subscribe">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 shadow-glow"
                  data-ocid="hero.primary_button"
                >
                  <Crown className="w-4 h-4" /> Subscribe to Watch
                </Button>
              </Link>
            ) : (
              <Link to="/video/$id" params={{ id: video.id }}>
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-semibold gap-2 shadow-lg"
                  data-ocid="hero.primary_button"
                >
                  <Play className="w-4 h-4" fill="black" /> Play
                </Button>
              </Link>
            )}
            <Link to="/video/$id" params={{ id: video.id }}>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2 backdrop-blur-sm"
                data-ocid="hero.secondary_button"
              >
                <Info className="w-4 h-4" /> More Info
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

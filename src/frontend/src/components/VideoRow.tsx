import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import type { Video } from "../backend";
import VideoCard from "./VideoCard";

interface VideoRowProps {
  title: string;
  videos: Video[];
  categoryLink?: string;
  size?: "sm" | "md" | "lg";
  isSubscribed?: boolean;
}

export default function VideoRow({
  title,
  videos,
  categoryLink,
  size = "md",
  isSubscribed,
}: VideoRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (videos.length === 0) return null;

  return (
    <motion.section
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-8">
        <h2 className="font-display font-semibold text-lg md:text-xl text-foreground">
          {title}
        </h2>
        {categoryLink && (
          <Link
            to={categoryLink as "/"}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            data-ocid="video.row.link"
          >
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div ref={rowRef} className="scroll-row px-4 md:px-8">
        {videos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            index={i}
            size={size}
            isSubscribed={isSubscribed}
          />
        ))}
      </div>
    </motion.section>
  );
}

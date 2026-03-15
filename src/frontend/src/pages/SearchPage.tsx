import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import { useSearchVideos } from "../hooks/useQueries";

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Read initial query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    setQuery(q);
    setDebouncedQuery(q);
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        navigate({
          to: "/search",
          search: { q: query } as never,
          replace: true,
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, navigate]);

  const { data: results = [], isLoading } = useSearchVideos(debouncedQuery);

  return (
    <div className="pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-2xl mb-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">
          Search
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, short films, music videos..."
            className="pl-10 bg-muted/50 border-border h-12 text-base"
            autoFocus
            data-ocid="search.search_input"
          />
        </div>
      </div>

      {isLoading && debouncedQuery && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          data-ocid="search.loading_state"
        >
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="aspect-video rounded-lg shimmer" />
          ))}
        </div>
      )}

      {!isLoading && debouncedQuery && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
          data-ocid="search.empty_state"
        >
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No results for &ldquo;{debouncedQuery}&rdquo;
          </p>
        </motion.div>
      )}

      {!isLoading && results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} results for &ldquo;{debouncedQuery}&rdquo;
          </p>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="search.list"
          >
            {results.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} size="lg" />
            ))}
          </div>
        </motion.div>
      )}

      {!debouncedQuery && (
        <div
          className="text-center py-24 text-muted-foreground"
          data-ocid="search.panel"
        >
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Start typing to search for videos</p>
        </div>
      )}
    </div>
  );
}

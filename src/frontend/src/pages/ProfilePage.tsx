import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { Crown } from "lucide-react";
import { motion } from "motion/react";
import LoginPrompt from "../components/LoginPrompt";
import VideoCard from "../components/VideoCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllVideos,
  useFavorites,
  useIsPremium,
  useWatchHistory,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: allVideos = [] } = useAllVideos();
  const { data: favoriteIds = [] } = useFavorites();
  const { data: historyIds = [] } = useWatchHistory();
  const { data: isPremium } = useIsPremium();

  if (!identity) {
    return (
      <div className="pt-16">
        <LoginPrompt message="Sign in to view your profile, favorites, and watch history" />
      </div>
    );
  }

  const favorites = allVideos.filter((v) => favoriteIds.includes(v.id));
  const history = allVideos.filter((v) => historyIds.includes(v.id));
  const principal = identity.getPrincipal().toString();
  const shortPrincipal = `${principal.slice(0, 8)}...${principal.slice(-6)}`;

  return (
    <div className="pt-24 pb-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground text-sm font-mono">
            {shortPrincipal}
          </p>
        </div>
        {isPremium && (
          <Badge className="ml-auto bg-primary/20 text-primary border border-primary/30 gap-1">
            <Crown className="w-3 h-3" /> Premium
          </Badge>
        )}
      </motion.div>

      <Tabs defaultValue="favorites" data-ocid="profile.tab">
        <TabsList className="bg-muted/50 border border-border mb-6">
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="profile.favorites.tab"
          >
            Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="profile.history.tab"
          >
            Watch History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="profile.favorites.empty_state"
            >
              <p>No favorites yet. Save videos you love!</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              data-ocid="profile.favorites.list"
            >
              {favorites.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} size="lg" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="profile.history.empty_state"
            >
              <p>No watch history yet. Start watching!</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              data-ocid="profile.history.list"
            >
              {history.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} size="lg" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

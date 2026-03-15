import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Video as VideoType } from "../backend";
import LoginPrompt from "../components/LoginPrompt";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddVideoMutation,
  useAllVideos,
  useDeleteVideoMutation,
  useIsAdmin,
  useSubscriberCount,
  useTotalUsers,
  useUpdateVideoMutation,
  useVideoAnalytics,
} from "../hooks/useQueries";

const CATEGORIES = ["Movies", "Short Films", "Music Videos", "Children"];
const MONTHLY_RATE = 9.99;

function generateId() {
  return `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const emptyVideo = (): VideoType => ({
  id: generateId(),
  title: "",
  description: "",
  category: "Movies",
  thumbnailUrl: "",
  videoUrl: "",
  isPremium: false,
  uploadedAt: BigInt(Date.now()),
  views: BigInt(0),
});

interface VideoFormProps {
  initial?: VideoType;
  onSave: (v: VideoType) => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
}

function VideoForm({ initial, onSave, isSaving, onClose }: VideoFormProps) {
  const [form, setForm] = useState<VideoType>(initial ?? emptyVideo());

  const update = (patch: Partial<VideoType>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) {
      toast.error("Title and video URL are required");
      return;
    }
    await onSave(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Video title"
          className="bg-muted/50"
          required
          data-ocid="admin.video.input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Video description..."
          className="bg-muted/50 min-h-[80px]"
          data-ocid="admin.video.textarea"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => update({ category: v })}
          >
            <SelectTrigger
              className="bg-muted/50"
              data-ocid="admin.video.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Premium</Label>
          <div className="flex items-center gap-2 h-9 mt-1">
            <Switch
              checked={form.isPremium}
              onCheckedChange={(v) => update({ isPremium: v })}
              data-ocid="admin.video.switch"
            />
            <span className="text-sm text-muted-foreground">
              {form.isPremium ? "Premium" : "Free"}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL *</Label>
        <Input
          id="videoUrl"
          value={form.videoUrl}
          onChange={(e) => update({ videoUrl: e.target.value })}
          placeholder="YouTube, Vimeo, or direct video URL"
          className="bg-muted/50"
          required
          data-ocid="admin.video.input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
        <Input
          id="thumbnailUrl"
          value={form.thumbnailUrl}
          onChange={(e) => update({ thumbnailUrl: e.target.value })}
          placeholder="https://... (leave empty for auto-generated)"
          className="bg-muted/50"
          data-ocid="admin.video.input"
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          data-ocid="admin.video.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground"
          disabled={isSaving}
          data-ocid="admin.video.submit_button"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Save Video"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: videos = [], isLoading: videosLoading } = useAllVideos();
  const { data: analytics = [] } = useVideoAnalytics();
  const { data: totalUsers } = useTotalUsers();
  const { data: subscriberCount } = useSubscriberCount();
  const { actor } = useActor();
  const addVideo = useAddVideoMutation();
  const updateVideo = useUpdateVideoMutation();
  const deleteVideo = useDeleteVideoMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<VideoType | null>(null);
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState("US,GB,CA,AU");
  const [stripeSaving, setStripeSaving] = useState(false);

  if (!identity) {
    return (
      <div className="pt-16">
        <LoginPrompt message="Admin access requires authentication" />
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="pt-24 px-8" data-ocid="admin.loading_state">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full shimmer" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-24 text-center" data-ocid="admin.error_state">
        <p className="text-muted-foreground">You do not have admin access.</p>
      </div>
    );
  }

  const handleSaveStripe = async () => {
    if (!actor || !stripeKey) {
      toast.error("Please enter a Stripe secret key");
      return;
    }
    setStripeSaving(true);
    try {
      await actor.setStripeConfiguration({
        secretKey: stripeKey,
        allowedCountries: stripeCountries.split(",").map((s) => s.trim()),
      });
      toast.success("Stripe configuration saved");
    } catch {
      toast.error("Failed to save Stripe config");
    } finally {
      setStripeSaving(false);
    }
  };

  const subCount = Number(subscriberCount ?? 0);
  const userCount = Number(totalUsers ?? 0);
  const monthlyRevenue = subCount * MONTHLY_RATE;
  const annualRevenue = monthlyRevenue * 12;

  return (
    <div className="pt-24 pb-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your Ozone TV platform
        </p>
      </motion.div>

      <Tabs defaultValue="videos" data-ocid="admin.tab">
        <TabsList className="bg-muted/50 border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger
            value="videos"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.videos.tab"
          >
            <Video className="w-4 h-4" /> Videos
          </TabsTrigger>
          <TabsTrigger
            value="subscribers"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.subscribers.tab"
          >
            <Users className="w-4 h-4" /> Subscribers
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.payments.tab"
          >
            <CreditCard className="w-4 h-4" /> Payments
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.analytics.tab"
          >
            <BarChart3 className="w-4 h-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-ocid="admin.settings.tab"
          >
            <Settings className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-foreground">
              All Videos ({videos.length})
            </h2>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-primary text-primary-foreground gap-2"
                  data-ocid="admin.videos.open_modal_button"
                >
                  <Plus className="w-4 h-4" /> Upload Video
                </Button>
              </DialogTrigger>
              <DialogContent
                className="bg-card border-border max-w-lg"
                data-ocid="admin.videos.dialog"
              >
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Upload New Video
                  </DialogTitle>
                </DialogHeader>
                <VideoForm
                  onSave={async (v) => {
                    await addVideo.mutateAsync(v);
                    toast.success("Video added!");
                  }}
                  isSaving={addVideo.isPending}
                  onClose={() => setAddOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {videosLoading ? (
            <Skeleton
              className="h-64 w-full shimmer"
              data-ocid="admin.videos.loading_state"
            />
          ) : (
            <div
              className="rounded-lg border border-border overflow-hidden"
              data-ocid="admin.videos.table"
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Views
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video, i) => (
                    <TableRow
                      key={video.id}
                      className="border-border"
                      data-ocid={`admin.videos.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                        {video.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {video.category}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {Number(video.views).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            video.isPremium
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {video.isPremium ? "Premium" : "Free"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Dialog
                            open={editVideo?.id === video.id}
                            onOpenChange={(o) => !o && setEditVideo(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => setEditVideo(video)}
                                data-ocid={`admin.videos.edit_button.${i + 1}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              className="bg-card border-border max-w-lg"
                              data-ocid="admin.videos.dialog"
                            >
                              <DialogHeader>
                                <DialogTitle className="font-display">
                                  Edit Video
                                </DialogTitle>
                              </DialogHeader>
                              {editVideo && (
                                <VideoForm
                                  initial={editVideo}
                                  onSave={async (v) => {
                                    await updateVideo.mutateAsync(v);
                                    toast.success("Video updated!");
                                    setEditVideo(null);
                                  }}
                                  isSaving={updateVideo.isPending}
                                  onClose={() => setEditVideo(null)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                data-ocid={`admin.videos.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              className="bg-card border-border"
                              data-ocid="admin.videos.dialog"
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Video?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  This will permanently delete &ldquo;
                                  {video.title}&rdquo;. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.videos.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() => {
                                    deleteVideo.mutate(video.id);
                                    toast.success("Video deleted");
                                  }}
                                  data-ocid="admin.videos.confirm_button"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {videos.length === 0 && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admin.videos.empty_state"
                >
                  No videos yet. Click &ldquo;Upload Video&rdquo; to add your
                  first video!
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" data-ocid="admin.subscribers.panel">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card
              className="bg-card border-border"
              data-ocid="admin.subscribers.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> Active Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-3xl text-foreground">
                  {subCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Paying members
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-card border-border"
              data-ocid="admin.subscribers.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-3xl text-foreground">
                  {userCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered accounts
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-card border-border"
              data-ocid="admin.subscribers.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Conversion
                  Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-3xl text-foreground">
                  {userCount > 0
                    ? ((subCount / userCount) * 100).toFixed(1)
                    : "0.0"}
                  %
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Users who subscribed
                </p>
              </CardContent>
            </Card>
          </div>

          <div
            className="rounded-lg border border-border bg-card/50 p-6"
            data-ocid="admin.subscribers.panel"
          >
            <h2 className="font-semibold text-base text-foreground mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Subscriber Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Detailed subscriber records are stored on-chain via the Internet
              Computer. Aggregate stats above are fetched directly from the
              backend canister. Individual subscriber management (view, cancel,
              refund) can be done through the Stripe Dashboard once your Stripe
              key is configured in the Settings tab.
            </p>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" data-ocid="admin.payments.panel">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card
              className="bg-card border-border"
              data-ocid="admin.payments.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" /> Monthly
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-3xl text-foreground">
                  $
                  {monthlyRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subCount} subscribers × ${MONTHLY_RATE}/mo
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-card border-border"
              data-ocid="admin.payments.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Annual
                  Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-3xl text-foreground">
                  $
                  {annualRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on current subscribers
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-card border-border"
              data-ocid="admin.payments.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Plan Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-3xl text-foreground">
                  ${MONTHLY_RATE}
                  <span className="text-base font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Standard subscription
                </p>
              </CardContent>
            </Card>
          </div>

          <div
            className="rounded-lg border border-border bg-card/50 p-6"
            data-ocid="admin.payments.panel"
          >
            <h2 className="font-semibold text-base text-foreground mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Payment
              Configuration
            </h2>
            <p className="text-sm text-muted-foreground">
              Revenue estimates above are calculated from your current
              subscriber count. To enable real payment processing and view
              detailed transaction history, add your Stripe Secret Key in the{" "}
              <strong className="text-foreground">Settings</strong> tab. Once
              configured, all payments are handled securely through Stripe.
            </p>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div
              className="bg-card border border-border rounded-xl p-6"
              data-ocid="admin.analytics.card"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Total Users
                </span>
              </div>
              <p className="font-display font-bold text-3xl text-foreground">
                {userCount.toLocaleString()}
              </p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6"
              data-ocid="admin.analytics.card"
            >
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Subscribers
                </span>
              </div>
              <p className="font-display font-bold text-3xl text-foreground">
                {subCount.toLocaleString()}
              </p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6"
              data-ocid="admin.analytics.card"
            >
              <div className="flex items-center gap-3 mb-2">
                <Video className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Total Videos
                </span>
              </div>
              <p className="font-display font-bold text-3xl text-foreground">
                {videos.length}
              </p>
            </div>
          </div>

          <h2 className="font-semibold text-lg mb-4">Video Performance</h2>
          <div
            className="rounded-lg border border-border overflow-hidden"
            data-ocid="admin.analytics.table"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Video</TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Views
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map(([id, views], i) => {
                  const vid = videos.find((v) => v.id === id);
                  return (
                    <TableRow
                      key={id}
                      className="border-border"
                      data-ocid={`admin.analytics.row.${i + 1}`}
                    >
                      <TableCell className="text-foreground">
                        {vid?.title ?? id}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {Number(views).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {analytics.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="admin.analytics.empty_state"
                    >
                      No analytics data yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="max-w-md">
            <h2 className="font-semibold text-lg mb-6">Stripe Configuration</h2>
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                <Input
                  id="stripeKey"
                  type="password"
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  placeholder="sk_live_..."
                  className="bg-muted/50 font-mono text-sm"
                  data-ocid="admin.settings.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripeCountries">
                  Allowed Countries (comma-separated)
                </Label>
                <Input
                  id="stripeCountries"
                  value={stripeCountries}
                  onChange={(e) => setStripeCountries(e.target.value)}
                  placeholder="US,GB,CA,AU"
                  className="bg-muted/50"
                  data-ocid="admin.settings.input"
                />
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={handleSaveStripe}
                disabled={stripeSaving}
                data-ocid="admin.settings.save_button"
              >
                {stripeSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

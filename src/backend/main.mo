import Blob "mo:core/Blob";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  let videos = Map.empty<Text, Video>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Video = {
    id : Text;
    title : Text;
    description : Text;
    category : Text;
    thumbnailUrl : Text;
    videoUrl : Text;
    isPremium : Bool;
    uploadedAt : Int;
    views : Nat;
  };

  public type UserProfile = {
    watchHistory : [Text];
    favorites : [Text];
    subscriptionStatus : Bool;
  };

  module Video {
    public func compare(video1 : Video, video2 : Video) : Order.Order {
      video1.title.compare(video2.title);
    };
  };

  func incrementViewCount(videoId : Text) : () {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        videos.add(videoId, { video with views = video.views + 1 });
      };
    };
  };

  func addToWatchHistory(caller : Principal, videoId : Text) : () {
    let profile = getProfile(caller);
    if (not profile.watchHistory.any(func(id) { id == videoId })) {
      let historyList = List.fromArray(profile.watchHistory);
      historyList.add(videoId);
      let updatedProfile = {
        profile with
        watchHistory = historyList.toArray();
      };
      userProfiles.add(caller, updatedProfile);
    };
  };

  func getProfile(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile = {
          watchHistory = [];
          favorites = [];
          subscriptionStatus = false;
        };
        userProfiles.add(caller, newProfile);
        newProfile;
      };
      case (?profile) { profile };
    };
  };

  // Public: Claim admin if no admin is assigned yet.
  // Returns true if the caller became admin, false if admin was already set.
  // This allows the first user to log in to always become admin.
  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      return true;
    };
    return false;
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only: Add video
  public shared ({ caller }) func addVideo(video : Video) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add videos");
    };
    videos.add(video.id, video);
  };

  // Admin-only: Update video
  public shared ({ caller }) func updateVideo(video : Video) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update videos");
    };
    videos.add(video.id, video);
  };

  // Admin-only: Delete video
  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    videos.remove(videoId);
  };

  // Public: Get all videos (guests can see non-premium videos)
  public query ({ caller }) func getAllVideos() : async [Video] {
    let isPremiumUser = AccessControl.isAdmin(accessControlState, caller) or getProfile(caller).subscriptionStatus;
    videos.values().toArray().filter(
      func(video) {
        not video.isPremium or isPremiumUser;
      }
    ).sort();
  };

  // Public: Search videos
  public query ({ caller }) func searchVideos(keyword : Text) : async [Video] {
    let isPremiumUser = AccessControl.isAdmin(accessControlState, caller) or getProfile(caller).subscriptionStatus;
    videos.values().toArray().filter(
      func(video) {
        video.title.toLower().contains(#text(keyword.toLower())) and (not video.isPremium or isPremiumUser);
      }
    );
  };

  // Public: Filter by category
  public query ({ caller }) func filterByCategory(category : Text) : async [Video] {
    let isPremiumUser = AccessControl.isAdmin(accessControlState, caller) or getProfile(caller).subscriptionStatus;
    videos.values().toArray().filter(
      func(video) {
        video.category.toLower().contains(#text(category.toLower())) and (not video.isPremium or isPremiumUser);
      }
    );
  };

  // User-only: View a video
  public shared ({ caller }) func viewVideo(videoId : Text) : async Video {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view videos");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let isPremiumUser = AccessControl.isAdmin(accessControlState, caller) or getProfile(caller).subscriptionStatus;
        if (video.isPremium and not isPremiumUser) {
          Runtime.trap("Unauthorized: Premium subscription required");
        };
        incrementViewCount(videoId);
        addToWatchHistory(caller, videoId);
        video;
      };
    };
  };

  // User-only: Add favorite
  public shared ({ caller }) func addFavorite(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add favorites");
    };
    let profile = getProfile(caller);
    if (not profile.favorites.any(func(id) { id == videoId })) {
      let favoritesList = List.fromArray(profile.favorites);
      favoritesList.add(videoId);
      userProfiles.add(caller, { profile with favorites = favoritesList.toArray() });
    };
  };

  // User-only: Remove favorite
  public shared ({ caller }) func removeFavorite(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove favorites");
    };
    let profile = getProfile(caller);
    let filteredFavorites = profile.favorites.filter(func(id) { id != videoId });
    userProfiles.add(caller, { profile with favorites = filteredFavorites });
  };

  // User-only: Get favorites
  public query ({ caller }) func getFavorites() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };
    getProfile(caller).favorites;
  };

  // User-only: Get watch history
  public query ({ caller }) func getWatchHistory() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view watch history");
    };
    getProfile(caller).watchHistory;
  };

  // User-only: Check premium status
  public query ({ caller }) func isPremium() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check premium status");
    };
    getProfile(caller).subscriptionStatus;
  };

  // Public: Check if Stripe is configured
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  // Admin-only: Set Stripe configuration
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be configured first") };
      case (?value) { value };
    };
  };

  // User-only: Create Stripe checkout session
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start checkout");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Public: Get Stripe session status
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // Public: Transform function for HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Admin-only: Mark user as premium
  public shared ({ caller }) func markPremium(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark users as premium");
    };
    let profile = getProfile(user);
    userProfiles.add(user, { profile with subscriptionStatus = true });
  };

  // Admin-only: Get total users
  public query ({ caller }) func getTotalUsers() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    userProfiles.size();
  };

  // Admin-only: Get subscriber count
  public query ({ caller }) func getSubscriberCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    userProfiles.values().toArray().filter(func(p) { p.subscriptionStatus }).size();
  };

  // Admin-only: Get video analytics
  public query ({ caller }) func getVideoAnalytics() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    videos.entries().toArray().map(func((id, video)) : (Text, Nat) { (video.title, video.views) });
  };
};

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

  // Old profile type for stable memory compatibility during migration
  type UserProfileV1 = {
    watchHistory : [Text];
    favorites : [Text];
    subscriptionStatus : Bool;
  };

  // New profile type with name and phone
  public type UserProfile = {
    name : Text;
    phone : Text;
    watchHistory : [Text];
    favorites : [Text];
    subscriptionStatus : Bool;
  };

  // Legacy stable variable — keeps old name so existing stable memory deserializes correctly
  let userProfiles = Map.empty<Principal, UserProfileV1>();

  // New stable variable with updated type
  let userProfilesV2 = Map.empty<Principal, UserProfile>();

  // Migrate old profiles into new map on upgrade
  system func postupgrade() {
    for ((principal, old) in userProfiles.entries()) {
      // Only migrate if not already present in v2
      switch (userProfilesV2.get(principal)) {
        case (null) {
          userProfilesV2.add(principal, {
            name = "";
            phone = "";
            watchHistory = old.watchHistory;
            favorites = old.favorites;
            subscriptionStatus = old.subscriptionStatus;
          });
        };
        case (?_) {};
      };
    };
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
      userProfilesV2.add(caller, { profile with watchHistory = historyList.toArray() });
    };
  };

  func getProfile(caller : Principal) : UserProfile {
    switch (userProfilesV2.get(caller)) {
      case (null) {
        let newProfile = {
          name = "";
          phone = "";
          watchHistory = [];
          favorites = [];
          subscriptionStatus = false;
        };
        userProfilesV2.add(caller, newProfile);
        newProfile;
      };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      return true;
    };
    return false;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfilesV2.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfilesV2.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfilesV2.add(caller, profile);
  };

  public shared ({ caller }) func addVideo(video : Video) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add videos");
    };
    videos.add(video.id, video);
  };

  public shared ({ caller }) func updateVideo(video : Video) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update videos");
    };
    videos.add(video.id, video);
  };

  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    videos.remove(videoId);
  };

  public query ({ caller }) func getAllVideos() : async [Video] {
    let isPremiumUser = AccessControl.isAdmin(accessControlState, caller) or getProfile(caller).subscriptionStatus;
    videos.values().toArray().filter(
      func(video) {
        not video.isPremium or isPremiumUser;
      }
    ).sort();
  };

  public query ({ caller }) func searchVideos(keyword : Text) : async [Video] {
    let isPremiumUser = AccessControl.isAdmin(accessControlState, caller) or getProfile(caller).subscriptionStatus;
    videos.values().toArray().filter(
      func(video) {
        video.title.toLower().contains(#text(keyword.toLower())) and (not video.isPremium or isPremiumUser);
      }
    );
  };

  public query ({ caller }) func filterByCategory(category : Text) : async [Video] {
    let isPremiumUser = AccessControl.isAdmin(accessControlState, caller) or getProfile(caller).subscriptionStatus;
    videos.values().toArray().filter(
      func(video) {
        video.category.toLower().contains(#text(category.toLower())) and (not video.isPremium or isPremiumUser);
      }
    );
  };

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

  public shared ({ caller }) func addFavorite(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add favorites");
    };
    let profile = getProfile(caller);
    if (not profile.favorites.any(func(id) { id == videoId })) {
      let favoritesList = List.fromArray(profile.favorites);
      favoritesList.add(videoId);
      userProfilesV2.add(caller, { profile with favorites = favoritesList.toArray() });
    };
  };

  public shared ({ caller }) func removeFavorite(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove favorites");
    };
    let profile = getProfile(caller);
    let filteredFavorites = profile.favorites.filter(func(id) { id != videoId });
    userProfilesV2.add(caller, { profile with favorites = filteredFavorites });
  };

  public query ({ caller }) func getFavorites() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };
    getProfile(caller).favorites;
  };

  public query ({ caller }) func getWatchHistory() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view watch history");
    };
    getProfile(caller).watchHistory;
  };

  public query ({ caller }) func isPremium() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check premium status");
    };
    getProfile(caller).subscriptionStatus;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

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

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start checkout");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func markPremium(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark users as premium");
    };
    let profile = getProfile(user);
    userProfilesV2.add(user, { profile with subscriptionStatus = true });
  };

  public query ({ caller }) func getTotalUsers() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    userProfilesV2.size();
  };

  public query ({ caller }) func getSubscriberCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    userProfilesV2.values().toArray().filter(func(p) { p.subscriptionStatus }).size();
  };

  public query ({ caller }) func getVideoAnalytics() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    videos.entries().toArray().map(func((id, video)) : (Text, Nat) { (video.title, video.views) });
  };
};

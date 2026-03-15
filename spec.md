# Ozone TV

## Current State
Videos marked as `isPremium` are gated behind a subscription. Free (non-premium) videos play for any visitor, logged in or not. The home page and category pages show all video thumbnails to everyone.

## Requested Changes (Diff)

### Add
- Subscription wall on ALL videos, not just premium ones: any visitor who is not a subscriber sees a locked player with a "Subscribe to Watch" message and a Subscribe Now CTA.
- Home page hero and video cards show a lock/crown overlay on thumbnails for non-subscribers so the content is visible but clearly gated.

### Modify
- `VideoPlayerPage`: change lock logic so that ANY video (premium or not) requires an active subscription. Non-logged-in users see "Sign in to watch"; logged-in non-subscribers see "Subscribe to watch".
- `VideoCard` / `HeroSection`: show a subtle lock badge on all cards when the user is not subscribed.

### Remove
- Nothing removed.

## Implementation Plan
1. In `VideoPlayerPage`, replace the `isPremiumLocked` / `isContentLocked` logic with a unified check: if not subscribed (regardless of `video.isPremium`), show the subscribe wall.
2. In `VideoCard`, add a small crown/lock overlay on the thumbnail when the current user is not a subscriber.
3. In `HeroSection`, add a lock overlay or change the CTA to "Subscribe to Watch" for non-subscribers.

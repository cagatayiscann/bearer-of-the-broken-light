/**
 * Thin wrapper around the ad SDK so the rest of the app never imports it directly.
 * Stubbed for now; swap the bodies for real AdMob (expo-ads) calls later.
 *
 * Design rule (GAME_DESIGN.md §9): ads are an optional reward, never a punishment.
 */

/** Resolves true if the user watched to completion and earned the reward. */
export async function showRewardedAd(): Promise<boolean> {
  // TODO: integrate AdMob rewarded video. Simulate a watched ad for now.
  await new Promise((r) => setTimeout(r, 600));
  return true;
}

/** Shown only at theme/entity transitions; optional and lore-framed. */
export async function showInterstitial(): Promise<void> {
  // TODO: integrate AdMob interstitial.
}

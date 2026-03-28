import { ReceivedSupportDigest } from "@/lib/types";

const SUPPORT_SEEN_KEY = "becoming-support-digest-seen";

export function getSupportDigestSignature(digest: ReceivedSupportDigest) {
  return digest.receivedAt;
}

export function hasSeenSupportDigest(digest: ReceivedSupportDigest) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SUPPORT_SEEN_KEY) === getSupportDigestSignature(digest);
}

export function markSupportDigestSeen(digest: ReceivedSupportDigest) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUPPORT_SEEN_KEY, getSupportDigestSignature(digest));
}

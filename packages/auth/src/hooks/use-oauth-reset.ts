import { useEffect } from "react";

/**
 * Resets OAuth loading state when the window regains focus.
 * Better Auth's signIn.social() uses a popup by default - when the user
 * returns from the popup (closes it or switches back), the opener page
 * still has oauthLoading set, leaving buttons disabled. This hook fixes
 * that by resetting when focus returns.
 */
export function useOAuthReset(oauthLoading: "github" | "google" | null, reset: () => void) {
  useEffect(() => {
    if (oauthLoading === null) return;
    if (typeof window === "undefined") return;

    function handleFocus() {
      reset();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [oauthLoading, reset]);
}

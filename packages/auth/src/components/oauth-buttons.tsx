import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from "react";
import { authClient } from "../client";
import { useOAuthReset } from "../hooks/use-oauth-reset";

type OAuthProvider = "github" | "google";

type OAuthButtonGroupContextValue = {
  oauthLoading: OAuthProvider | null;
  callbackURL: string;
  onError: (message: string) => void;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
};

const OAuthButtonGroupContext = createContext<OAuthButtonGroupContextValue | null>(null);

function useOAuthButtonGroup() {
  const ctx = useContext(OAuthButtonGroupContext);
  if (!ctx) {
    throw new Error("OAuthButton must be used within OAuthButtonGroup");
  }
  return ctx;
}

type OAuthButtonGroupProps = {
  children: ReactNode;
  callbackURL?: string;
  onError?: (message: string) => void;
  /** Called when window regains focus (e.g. popup closed). Use router.invalidate() to re-run loaders. */
  onFocusReturn?: () => void;
};

export function OAuthButtonGroup({
  children,
  callbackURL = "/",
  onError = () => {},
  onFocusReturn,
}: OAuthButtonGroupProps) {
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const onErrorRef = useRef(onError);
  const onFocusReturnRef = useRef(onFocusReturn);
  onErrorRef.current = onError;
  onFocusReturnRef.current = onFocusReturn;

  const reset = useCallback(() => {
    setOauthLoading(null);
    onFocusReturnRef.current?.();
  }, []);

  useOAuthReset(oauthLoading, reset);

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider) => {
      setOauthLoading(provider);
      onErrorRef.current(""); // Clear previous error

      try {
        await authClient.signIn.social({
          callbackURL,
          provider,
        });
      } catch {
        onErrorRef.current(`Failed to sign in with ${provider}`);
        setOauthLoading(null);
      }
    },
    [callbackURL],
  );

  const value: OAuthButtonGroupContextValue = {
    callbackURL,
    oauthLoading,
    onError,
    signInWithProvider,
  };

  return (
    <OAuthButtonGroupContext.Provider value={value}>{children}</OAuthButtonGroupContext.Provider>
  );
}

export type OAuthButtonRenderProps = {
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
};

type OAuthButtonProps = {
  provider: OAuthProvider;
  render: (props: OAuthButtonRenderProps) => ReactNode;
};

export function OAuthButton({ provider, render }: OAuthButtonProps) {
  const { oauthLoading, signInWithProvider } = useOAuthButtonGroup();
  const isLoading = oauthLoading === provider;
  const disabled = oauthLoading !== null;

  return (
    <>
      {render({
        disabled,
        isLoading,
        onClick: () => signInWithProvider(provider),
      })}
    </>
  );
}

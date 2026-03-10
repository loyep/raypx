import type { ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useNextThemeMock, nextThemeProviderMock, tooltipProviderMock, toasterMock } = vi.hoisted(
  () => ({
    useNextThemeMock: vi.fn(() => ({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: vi.fn(),
    })),
    nextThemeProviderMock: vi.fn(({ children }: { children: ReactNode }) => (
      <div data-theme-provider>{children}</div>
    )),
    tooltipProviderMock: vi.fn(({ children }: { children: ReactNode }) => (
      <div data-tooltip-provider>{children}</div>
    )),
    toasterMock: vi.fn(() => <div data-toaster />),
  }),
);

vi.mock("next-themes", () => ({
  ThemeProvider: nextThemeProviderMock,
  useTheme: useNextThemeMock,
}));

vi.mock("../components/ui/tooltip", () => ({
  TooltipProvider: tooltipProviderMock,
}));

vi.mock("../components/ui/sonner", () => ({
  Toaster: toasterMock,
}));

import { useIsHydrated } from "../hooks/use-hydrated";
import { useTheme } from "../hooks/use-theme";
import { DesignSystemProvider } from "../index";

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function HookProbe() {
  const hydrated = useIsHydrated();
  const theme = useTheme();

  return (
    <pre>
      {JSON.stringify({ hydrated, themeMode: theme.themeMode, resolvedTheme: theme.resolvedTheme })}
    </pre>
  );
}

describe("design-system providers and hooks", () => {
  it("composes theme, tooltip, and toaster providers", () => {
    const html = renderToStaticMarkup(
      <DesignSystemProvider forcedTheme="dark">
        <span>child</span>
      </DesignSystemProvider>,
    );

    expect(nextThemeProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: "class",
        defaultTheme: "system",
        disableTransitionOnChange: true,
        enableSystem: true,
        forcedTheme: "dark",
      }),
      undefined,
    );
    expect(tooltipProviderMock).toHaveBeenCalledTimes(1);
    expect(toasterMock).toHaveBeenCalledTimes(1);
    expect(html).toContain("child");
  });

  it("exposes hydration state and theme bindings", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<HookProbe />);
    });

    expect(container.textContent).toContain('"hydrated":true');
    expect(container.textContent).toContain('"themeMode":"dark"');
    expect(container.textContent).toContain('"resolvedTheme":"dark"');

    await act(async () => {
      root.unmount();
    });
  });
});

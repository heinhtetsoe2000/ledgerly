import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useOffline } from "next/offline";
import { OfflineBanner } from "@/components/offline-banner";

vi.mock("next/offline", () => ({ useOffline: vi.fn() }));

afterEach(cleanup);

describe("OfflineBanner", () => {
  it("shows a connection notice while offline", () => {
    vi.mocked(useOffline).mockReturnValue(true);

    render(<OfflineBanner />);

    expect(screen.getByRole("status").textContent).toContain("No internet connection");
  });

  it("stays hidden while online", () => {
    vi.mocked(useOffline).mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.queryByRole("status")).toBeNull();
  });
});
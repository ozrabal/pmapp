import { describe, it, expect, vi } from "vitest";
import { debounce } from "../utils/debounce";

describe("Utility Functions", () => {
  describe("debounce", () => {
    it("should call the function after the specified delay", () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(299);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledWith("test");
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("should reset the timer on subsequent calls", () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("test1");
      vi.advanceTimersByTime(200);

      debouncedFn("test2");
      vi.advanceTimersByTime(200);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith("test2");
      expect(mockFn).not.toHaveBeenCalledWith("test1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});

import { cx } from "class-variance-authority";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Box from "./Box";
import { actions } from "astro:actions";
import { useState } from "react";

export default function EarlyAccess() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Box
      className={cx(
        "md:max-w-2xl max-w-sm mx-auto border border-transparent animate-border"
        // "[background:linear-gradient(45deg,theme(colors.slate.950),theme(colors.slate.900)_100%,theme(colors.slate.800)_100%)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] border border-transparent animate-border"
      )}
      style={{
        background:
          "linear-gradient(45deg, oklch(0.129 0.042 264.695), oklch(0.208 0.042 265.755) 100%, oklch(0.279 0.041 260.031) 100%) padding-box, conic-gradient(from var(--border-angle), color-mix(in oklab, oklch(0.446 0.043 257.281) 48%, transparent) 80%, oklch(0.585 0.233 277.117) 86%, oklch(0.785 0.115 274.713) 90%, oklch(0.585 0.233 277.117) 94%, color-mix(in oklab, oklch(0.446 0.043 257.281) 48%, transparent)) border-box",
      }}
    >
      <form className="flex flex-col items-center gap-4 w-full" autoComplete="off" method="POST">
        <h2 className="text-3xl font-semibold tracking-tight text-center font-geist-mono">
          Plan My App is in early development!
        </h2>
        <h3 className="text-md font-geist-mono text-center">
          Join our early access list to stay updated on the latest features and improvements.
        </h3>
        {!sent && (
          <div className="flex flex-row w-full gap-2 justify-center items-center">
            <Input
              type="email"
              name="email"
              required
              placeholder="Enter your email here"
              className="border-slate-800 text-white placeholder:text-slate-700"
            />
            <Button
              disabled={sent}
              size="lg"
              variant="outline"
              className="border-slate-800 hover:bg-slate-950 hover:text-white"
              onClick={async (e) => {
                e.preventDefault();
                setError(null);
                const form = e.currentTarget.closest("form");
                if (!form) return;
                const formData = new FormData(form);
                const email = formData.get("email");
                if (typeof email !== "string" || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  setError("Please enter a valid email address.");
                  return;
                }
                const response = await actions.send(formData);
                if (response.error) {
                  setError("Failed to subscribe.");
                  return;
                }
                setSent(true);
              }}
            >
              Subscribe
            </Button>
          </div>
        )}
        {error && <h3 className="text-xl font-geist-mono text-center text-red-500">{error}</h3>}
        {sent && (
          <h3 className="text-xl font-geist-mono text-center text-pink-500">
            Thank you for subscribing! We&apos;ll keep you updated.
          </h3>
        )}
      </form>
      <p className="text-md font-geist-mono text-center mt-3">
        No spam. We will only send you updates about Plan My App.
      </p>
    </Box>
  );
}

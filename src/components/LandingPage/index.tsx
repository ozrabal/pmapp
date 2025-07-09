import { Bot, Waypoints, Blocks } from "lucide-react";
// import BackgroundAnimation from "./BackgroundAnimation";
import EarlyAccess from "./EarlyAccess";
import Feature from "./Feature";

export default function LandingPage() {
  return (
    <>
      <div className="flex flex-1 flex-col md:px-0 blur-none items-center justify-center gap-24">
        {/* <BackgroundAnimation /> */}
        <section className="flex flex-col max-w-2xl w-full items-center">
          <h1 className="main-title md:text-5xl font-semibold relative text-4xl tracking-tight text-center mt-20 mb-6 font-geist-mono">
            Bring Structure to Your <br />
            <span className="relative z-10 gradient-text bg-gradient-to-r bg-clip-text text-transparent font-geist-mono from-pink-600 to-red-400">
              Project Planning
              <span className="accent-underline"></span>
            </span>
          </h1>
          <p className="md:text-xl opacity-80 max-w-xl text-lg font-geist-mono text-center mb-24">
            Empower project managers and developers with AI-driven guidance on functional decomposition, validation, and
            scheduling. Plan smarter, launch faster.
          </p>

          <EarlyAccess />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            title="AI-Powered Planning"
            description="Get intelligent suggestions and validation for your project assumptions, functional blocks, and scheduling."
            icon={<Bot className="w-6 h-6 lucide lucide-bot" />}
          />

          <Feature
            title="Functional Block Division"
            description="Automatically divide your project into logical functional blocks for better organization and implementation."
            icon={<Blocks className="w-6 h-6 lucide lucide-brain-cog" />}
          />

          <Feature
            title="Smart Scheduling"
            description="Generate project schedules with key milestones and dependencies between project stages."
            icon={<Waypoints className="w-6 h-6 lucide lucide-calendar-days" />}
          />
        </section>
      </div>
    </>
  );
}

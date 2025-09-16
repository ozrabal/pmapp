import Box from "./Box";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function Feature({ title, description, icon }: FeatureProps) {
  return (
    <Box className="flex flex-col items-center text-center h-full p-6 gap-4">
      <div className="icon-bg">{icon}</div>
      <h3 className="font-medium feature-title text-3xl tracking-tight mb-1 font-geist-mono">
        <span className="bg-gradient-to-r bg-clip-text text-transparent font-geist-mono from-pink-500 to-red-400">
          {title}
        </span>
      </h3>
      <p className="opacity-70 text-lg">{description}</p>
    </Box>
  );
}

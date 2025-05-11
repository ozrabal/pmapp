import { Avatar as AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type AvatarProps = React.ComponentProps<typeof AvatarRoot> & {
  image: string;
  alt: string;
  fallback: string;
};

export default function Avatar({ image, alt, fallback, ...props }: AvatarProps) {
  return (
    <AvatarRoot {...props}>
      <AvatarImage className="w-full h-full rounded-full object-cover" src={image} alt={alt} />
      <AvatarFallback
        className="flex items-center justify-center w-full h-full bg-white text-[15px] font-medium text-violet-500"
        delayMs={600}
      >
        {fallback}
        <span className="sr-only">{alt}</span>
      </AvatarFallback>
    </AvatarRoot>
  );
}

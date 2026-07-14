import LogoLoader from "@/components/LogoLoader";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LogoLoader className="w-72 h-72 animate-draw" />
    </div>
  );
}

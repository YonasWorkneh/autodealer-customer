import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-white via-zinc-100 to-zinc-300"
        aria-hidden="true"
      />
      {/* Content */}
      <section className="relative z-10 mx-auto flex max-w-5xl h-full  flex-col items-center justify-center px-6 pt-6 md:pt-2">
        {/* 404 with tire */}
        <div className="relative mt-6 flex items-end justify-center gap-3 select-none">
          <span
            className="font-black leading-none text-zinc-900"
            style={{ fontSize: "clamp(120px, 20vw, 260px)" }}
            aria-hidden="true"
          >
            4
          </span>

          <div className="relative">
            {/* Tire */}
            <Image
              src="/tire.png"
              alt="Car tire representing the zero in 404"
              width={360}
              height={360}
              className="h-[clamp(120px,18vw,260px)] w-[clamp(120px,18vw,260px)] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
              priority
            />
            {/* Soft ground shadow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[88%] -z-10 h-8 w-[140%] -translate-x-1/2 rounded-[999px] bg-gradient-to-b from-black/25 to-transparent blur-[6px]"
            />
          </div>

          <span
            className="font-black leading-none text-zinc-900"
            style={{ fontSize: "clamp(120px, 20vw, 260px)" }}
            aria-hidden="true"
          >
            4
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-8 text-center text-3xl font-extrabold tracking-wide text-zinc-800 md:text-4xl">
          PAGE NOT FOUND!!
        </h1>
        <p className="mt-3 max-w-2xl text-center text-base text-zinc-600 md:text-lg">
          The page you are looking for might have been removed had its name
          changed or is temporarily unavailable.
        </p>

        {/* CTA */}
        <div className="mt-8">
          <Button
            asChild
            className="rounded-full bg-primary text-primary-foreground px-6 py-5 text-base font-semibold tracking-wide hover:bg-primary-hover"
          >
            <Link href="/">BACK TO HOMEPAGE</Link>
          </Button>
        </div>
      </section>

      {/* Bottom vignette to match screenshot */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-400 via-zinc-300/0 to-transparent"
        aria-hidden="true"
      />
    </main>
  );
}

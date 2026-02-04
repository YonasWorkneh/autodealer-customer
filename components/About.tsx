import { Smile } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function About() {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 py-20 bg-white">
      {/* Heading */}
      <div className="flex justify-center mb-10 relative">
        <h1 className="text-xl text-center uppercase relative">
          About us
          <span className="absolute top-1/2 left-[-120px] w-24 border-t border-black/20 -translate-y-1/2 hidden md:inline-block" />
          <span className="absolute top-1/2 right-[-120px] w-24 border-t border-black/20 -translate-y-1/2 hidden md:inline-block" />
        </h1>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-10 items-start">
        {/* Text */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mt-10 leading-snug">
          Instant, accurate, and reliable dealership <br /> of any vehicle you
          want at your fingertips
        </h2>

        {/* Avatars + description */}
        <div className="mt-10">
          <div className="flex -space-x-3">
            <Image
              src="/sales.jpeg"
              alt="user-img"
              width={50}
              height={50}
              className="border border-black/10 object-cover rounded-full"
            />
            <Image
              src="/sales3.jpg"
              alt="user-img"
              width={50}
              height={50}
              className="border border-black/10 object-cover rounded-full"
            />
            <Image
              src="/sales2.jpeg"
              alt="user-img"
              width={50}
              height={50}
              className="border border-black/10 object-cover rounded-full"
            />
          </div>
          <p className="text-sm mt-4 text-black/50 max-w-xs">
            Our professional team will help you make an informed decision before
            purchase of any vehicle.
          </p>
        </div>
      </div>

      {/* Car Image + Overlay Card */}
      <div className="flex justify-center mt-20 relative">
        <div className="relative w-full max-w-6xl">
          <Image
            src="/white.avif"
            alt="white-audi"
            width={1000}
            height={600}
            className="w-full h-auto object-cover rounded-lg"
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-black/10 p-4 rounded-xl w-72 sm:w-80">
            <div className="flex justify-center items-center bg-primary text-primary-foreground rounded-2xl p-3 w-fit mx-auto">
              <Smile className="text-white" />
            </div>
            <h3 className="mt-5 mb-2 text-xl font-semibold text-center">
              Easy to use
            </h3>
            <p className="text-sm text-black/60 text-center">
              Simply search for your favourite vehicle, gather as much
              information as possible, and contact our sales or the dealer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

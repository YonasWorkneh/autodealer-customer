"use client";

import Header from "@/components/Header";
import Image from "next/image";

export default function AuctionComingSoon() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header color="black" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="relative w-full max-w-lg mx-auto mb-12">
          <Image
            src="/auction-coming-soon.webp"
            alt="Auctions coming soon"
            width={600}
            height={400}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        <h1 className="text-4xl md:text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Coming Soon
        </h1>

        <p className="text-lg md:text-xl text-black/60 max-w-md mx-auto mb-10">
          Our live auction platform is being built. Get ready to bid on
          exclusive vehicles in real-time.
        </p>

        <div className="w-24 h-1 bg-primary rounded-full mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto text-left">
          {[
            {
              title: "Live Bidding",
              desc: "Compete with buyers in real-time auctions.",
            },
            {
              title: "Curated Inventory",
              desc: "Hand-picked vehicles you won't find anywhere else.",
            },
            {
              title: "Secure Transactions",
              desc: "Every bid and payment is fully protected.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-black/60 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

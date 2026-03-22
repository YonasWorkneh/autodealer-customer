"use client";

import React, { useState } from "react";
import { Menu, X, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/user";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/profile";
import { usePathname, useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";

interface HeaderProps {
  color?: string;
}

export default function Header({ color }: HeaderProps) {
  const { user } = useUserStore();
  const { data: profile } = useProfile();
  const { notifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const linkClasses = (isActive?: boolean) =>
    `${color === "black"
      ? "text-black hover:text-primary data-[active=true]:text-primary"
      : "text-white hover:text-primary data-[active=true]:text-primary"
    } relative py-2 rounded-md cursor-pointer transition-colors duration-200 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 data-[active=true]:after:scale-x-100`;

  const linkClassesPlain = () =>
    `${color === "black"
      ? "text-black hover:text-black/60"
      : "text-white hover:text-white/80"
    } px-4 py-2 rounded-md cursor-pointer transition-colors duration-200`;

  const { toast } = useToast();

  return (
    <header
      className={`relative z-20 flex items-center justify-between px-6 md:px-40 py-4 ${color === "black" && "border-b"
        }`}
    >
      {/* Logo */}
      <Link href={"/"} className="flex items-center gap-2 cursor-pointer">
        <Image
          src="/logo/logo.svg"
          alt="hulucars"
          width={140}
          height={40}
          className="h-28 w-auto"
          priority
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-10">
        <Link
          href={"/"}
          className={linkClasses(
            pathname === "/" || pathname.startsWith("/listing")
          )}
          data-active={pathname === "/" || pathname.startsWith("/listing")}
        >
          All inventory
        </Link>
        <Link
          href={"/auction"}
          className={linkClasses(pathname.startsWith("/auction"))}
          data-active={pathname.startsWith("/auction")}
        >
          Auctions
        </Link>
        <Link
          href={"/favorites"}
          className={linkClasses(pathname.startsWith("/favorites"))}
          data-active={pathname.startsWith("/favorites")}
        >
          Favourites
        </Link>
        <Link
          href={"/mylistings"}
          className={linkClasses(pathname.startsWith("/mylistings"))}
          data-active={pathname.startsWith("/mylistings")}
        >
          My Ads
        </Link>


        {user.email && (
          <Link href="/notifications" className="relative group">
            <div
              className={`p-2 rounded-full transition-colors ${color === "black"
                ? "text-black hover:bg-gray-100"
                : "text-white hover:bg-white/10"
                }`}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </Link>
        )}

        <Link
          href={user.email ? "profile" : "/signin"}
          className={linkClassesPlain()}
        >
          {user.email || profile?.first_name ? (
            <span
              className={`${color === "black"
                ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                : " bg-white/10 hover:bg-white/20"
                } size-10 flex justify-center items-center rounded-full uppercase`}
            >
              {profile?.first_name[0] || user.email[0]}
            </span>
          ) : (
            "Signin"
          )}
        </Link>
        <Link
          href={"/place-add"}
          className={`text-white ${
            color === "black"
              ? " bg-primary text-primary-foreground hover:bg-primary-hover"
              : " bg-white/10 hover:bg-white/20"
          } px-4 py-2 rounded-md cursor-pointer transition-colors duration-200`}
          onClick={(e) => {
            if (!user.email) {
              e.preventDefault();
              toast({
                description:
                  "❌   Log in or create an account to sell your car.",
              });
              return;
            }

            // If the user is not yet a dealer or broker, show offers immediately
            if (
              profile &&
              profile.dealer_profile === null &&
              profile.broker_profile === null
            ) {
              e.preventDefault();
              router.push("/pricing");
            }
          }}
        >
          Sell my Car
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden"
        aria-label="Open Menu"
      >
        <Menu
          className={`h-7 w-7 ${color === "black" ? "text-black" : "text-white"
            }`}
        />
      </button>

      {/* Mobile Drawer with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-30 flex">
            {/* Overlay */}
            <motion.div
              className="flex-1 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }} // enter from right
              animate={{ x: 0 }}
              exit={{ x: "100%" }} // leave to left
              transition={{ type: "tween", duration: 0.4 }}
              className="w-64 h-full bg-white p-6 flex flex-col space-y-6 shadow-xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="self-end text-gray-700"
                aria-label="Close Menu"
              >
                <X className="h-6 w-6" />
              </button>

              <Link
                href={"/"}
                onClick={() => setIsOpen(false)}
                className="text-gray-800 hover:text-gray-500"
              >
                Home
              </Link>
              <Link
                href={"/auction"}
                onClick={() => setIsOpen(false)}
                className="text-gray-800 hover:text-gray-500"
              >
                Auctions
              </Link>
              <Link
                href={"/favorites"}
                onClick={() => setIsOpen(false)}
                className="text-gray-800 hover:text-gray-500"
              >
                Favourites
              </Link>
              <Link
                href={user.email ? "profile" : "/signin"}
                onClick={() => setIsOpen(false)}
                className="text-gray-800 hover:text-gray-500"
              >
                {user.email ? `Profile (${user.email})` : "Signin"}
              </Link>
              <Link
                href={"/place-add"}
                onClick={(e) => {
                  if (!user.email) {
                    e.preventDefault();
                    toast({
                      description:
                        "❌ Log in or create an account to sell your car.",
                    });
                    return;
                  }

                  // If the user is not yet a dealer or broker, show offers immediately
                  if (
                    profile &&
                    profile.dealer_profile === null &&
                    profile.broker_profile === null
                  ) {
                    e.preventDefault();
                    setIsOpen(false);
                    router.push("/pricing");
                    return;
                  }

                  setIsOpen(false);
                }}
                className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary-hover"
              >
                Sell my Car
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

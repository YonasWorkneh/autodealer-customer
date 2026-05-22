"use client";

import { useState } from "react";
import { X, Bell, Home, Clock, Heart, LayoutList, BarChart2, User, Car } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/user";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/profile";
import { usePathname, useRouter } from "next/navigation";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";

interface HeaderProps {
  color?: string;
}

export default function Header({ color }: HeaderProps) {
  const { user } = useUserStore();
  const { data: profile } = useProfile();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const linkClasses = (_isActive?: boolean) =>
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
        {!(profile?.broker_profile || profile?.dealer_profile) && (
          <Link
            href={"/favorites"}
            className={linkClasses(pathname.startsWith("/favorites"))}
            data-active={pathname.startsWith("/favorites")}
          >
            Favourites
          </Link>
        )}
        <Link
          href={"/mylistings"}
          className={linkClasses(pathname.startsWith("/mylistings"))}
          data-active={pathname.startsWith("/mylistings")}
        >
          My Ads
        </Link>
        <Link
          href={"/analytics"}
          className={linkClasses(pathname.startsWith("/analytics"))}
          data-active={pathname.startsWith("/analytics")}
        >
          Analytics
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
              {profile?.first_name
                ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ""}`
                : user.email[0]}
            </span>
          ) : (
            "Signin"
          )}
        </Link>
        <Link
          href={'/place-add'}
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
        className="md:hidden p-2 -mr-2"
        aria-label="Open Menu"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={color === "black" ? "text-black" : "text-white"}
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="3" y1="18" x2="10" y2="18" />
        </svg>
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4 }}
              className="w-72 h-full bg-white flex flex-col shadow-xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <Image
                  src="/logo/logo.svg"
                  alt="hulucars"
                  width={100}
                  height={30}
                  className="h-7 w-auto"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
                {(
                  [
                    { href: "/", label: "Home", icon: Home, active: pathname === "/" || pathname.startsWith("/listing") },
                    { href: "/auction", label: "Auctions", icon: Clock, active: pathname.startsWith("/auction") },
                    ...(!( profile?.broker_profile || profile?.dealer_profile)
                      ? [{ href: "/favorites", label: "Favourites", icon: Heart, active: pathname.startsWith("/favorites") }]
                      : []),
                    { href: "/mylistings", label: "My Ads", icon: LayoutList, active: pathname.startsWith("/mylistings") },
                    { href: "/analytics", label: "Analytics", icon: BarChart2, active: pathname.startsWith("/analytics") },
                  ]
                ).map(({ href, label, icon: Icon, active }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs uppercase tracking-[0.25em] font-medium">{label}</span>
                  </Link>
                ))}
              </nav>

              {/* Profile */}
              <div className="px-4 pt-4 pb-3 border-t border-gray-100">
                <Link
                  href={user.email ? "/profile" : "/signin"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {user.email || profile?.first_name ? (
                    <span className="size-8 flex justify-center items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase shrink-0">
                      {profile?.first_name
                      ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ""}`
                      : user.email[0]}
                    </span>
                  ) : (
                    <User className="h-4 w-4 shrink-0 text-gray-400" />
                  )}
                  <span className="text-xs uppercase tracking-[0.25em] font-medium">
                    {user.email || profile?.first_name ? (profile?.first_name || "Profile") : "Sign In"}
                  </span>
                </Link>
              </div>

              {/* Sell my Car CTA */}
              <div className="px-4 pb-8">
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
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl text-xs uppercase tracking-[0.25em] font-medium hover:bg-primary-hover transition-colors"
                >
                  <Car className="h-4 w-4" />
                  Sell my Car
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

// components/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-10 px-6 md:px-40">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-primary-foreground/15 pb-8">
        {/* Logo & Description */}
        <div>
          <Link
            href="/"
            className="flex items-center space-x-3 transition-opacity hover:opacity-90"
          >
            <Image
              src="/wheel copy.png"
              alt="Car Dealer Logo"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold tracking-tight">
              hulucars
            </span>
          </Link>
          <p className="mt-4 text-primary-foreground/80 text-sm leading-relaxed">
            Premium cars. Exceptional service. Your trusted dealership for the
            perfect automobile.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary-foreground">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/listing"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              >
                Search
              </Link>
            </li>
            <li>
              <Link
                href="/favorites"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              >
                Favourites
              </Link>
            </li>
            <li>
              <Link
                href="/place-add"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              >
                Sell my Car
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary-foreground">
            Services
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/auction"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              >
                Trade-In
              </Link>
            </li>
            <li>
              <Link
                href="/test-drive"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              >
                Book a Test Drive
              </Link>
            </li>
            <li>
              <Link
                href="/place-add"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              >
                Sell your car
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary-foreground">
            Contact
          </h3>
          <p className="text-primary-foreground/80 text-sm">
            123 Main Street, Addis Ababa, Ethiopia
          </p>
          <p className="text-primary-foreground text-sm mt-1">
            Email: info@hulucars.com
          </p>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Phone: +251 900 123 456
          </p>

          {/* Socials */}
          <div className="flex space-x-4 mt-4">
            <Link
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-6 flex flex-col md:flex-row justify-center items-center text-primary-foreground/70 text-sm">
        <p>
          © {new Date().getFullYear()} hulucars. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

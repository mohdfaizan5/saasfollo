import Image from "next/image";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import Logo from "../logo";

export default function FooterSection() {
  return (
    <footer className="w-full bg-[#F6F1EA] border-t border-[#0C1510]/6">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Logo & social */}
          <div className="flex flex-col gap-4">
            <Logo full textClassName="text- ml-[1px] font-medium" />

            <div className="flex gap-3">
              <Link
                href="https://x.com/mohdfaizan_5"
                className="text-[#0C1510]/30 hover:text-[#0C1510] transition-colors"
              >
                <FaXTwitter size={16} />
              </Link>
              <Link
                href="https://x.com/_likitha_n"
                className="text-[#0C1510]/30 hover:text-[#0C1510] transition-colors"
              >
                <FaXTwitter size={16} />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-2.5">
              <Link
                href="/blog"
                className="text-[#0C1510]/40 text-sm font-sans hover:text-[#0C1510] transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/resources"
                className="text-[#0C1510]/40 text-sm font-sans hover:text-[#0C1510] transition-colors"
              >
                Resources
              </Link>
              <Link
                href="/changelog"
                className="text-[#0C1510]/40 text-sm font-sans hover:text-[#0C1510] transition-colors"
              >
                Changelog
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-[#0C1510]/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-[#0C1510]/25 text-xs font-sans">
              &copy; {new Date().getFullYear()} SaaSFollo. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-[#0C1510]/25 text-xs font-sans hover:text-[#0C1510]/50 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-[#0C1510]/25 text-xs font-sans hover:text-[#0C1510]/50 transition-colors"
              >
                Terms and Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

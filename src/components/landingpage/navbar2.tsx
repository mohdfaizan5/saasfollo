import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import Logo from "../logo";

const Navbar2 = () => {
  return (
    <nav className="w-full flex justify-center py-5 px-6 relative z-20">
      <div className="w-full max-w-4xl flex justify-between items-center">
        <Logo height={24} width={24} full textClassName="text-foreground ml-[1px] text-base font-medium" />
        <div className="flex items-center gap-5">
          <Link
            href="/blog"
            className="text-foreground/80 text-[13px] font-sans hover:text-foreground transition-colors hidden sm:block"
          >
            Blog
          </Link>
          <Link
            href="/resources"
            className="text-foreground/80 text-[13px] font-sans hover:text-foreground transition-colors hidden sm:block"
          >
            Resources
          </Link>
          <Link
            href="/auth/login"
            className="h-8 px-5 bg-[#F6F1EA] text-[#2C4839] text-[13px] font-medium font-sans rounded-full flex items-center hover:bg-white transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>

  );
};

export default Navbar2;

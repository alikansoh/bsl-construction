"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";


export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthOrDashboard =
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard");

  if (isAuthOrDashboard) {
    return <>{children}</>;
  }

  return (
    <>
    <ChatWidget />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
import Image from "next/image";
import Hero from "../components/Hero";
import Services from "@/components/Services";
import WhoWeAre from "@/components/WhoWeAre";

export default function Home() {
  return (
   <main>
    <Hero />
    <WhoWeAre />

    <Services />
      </main>
  );
}

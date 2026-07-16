import Image from "next/image";
import Hero from "../components/Hero";
import Services from "@/components/Services";
import WhoWeAre from "@/components/WhoWeAre";
import Projects from "@/components/Projects";
import WhyChooseUs from "@/components/WhyChooseUs";

export default function Home() {
  return (
   <main>
    <Hero />
    <WhoWeAre />

    <Services />
    <Projects />
    <WhyChooseUs />
      </main>
  );
}

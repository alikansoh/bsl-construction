import Image from "next/image";
import Hero from "../components/Hero";
import Services from "@/components/Services";
import WhoWeAre from "@/components/WhoWeAre";
import Projects from "@/components/Projects";
import WhyChooseUs from "@/components/WhyChooseUs";
import OurProcess from "@/components/OurProcess";
import Gallery from "@/components/Gallery";
import Cta from "@/components/Cta";
import FAQ from "@/components/Faqs";

export default function Home() {
  return (
   <main>
    <Hero />
    <WhoWeAre />

    <Services />
    <Projects />
    <WhyChooseUs />
    <OurProcess />
    <Gallery />
    <Cta />
    <FAQ />

      </main>
  );
}

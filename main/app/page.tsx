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
import AccreditationsMarquee from "@/components/AccreditationsMarquee";
import HotelCommercial from "@/components/HotelCommercial";

export default function Home() {
  return (
   <main>
    <Hero />
    <WhoWeAre />

    <Services />
    <HotelCommercial />
    <Projects />
    <WhyChooseUs />
    <OurProcess />
    <Gallery />
    <Cta />
    <FAQ />
    <AccreditationsMarquee />

      </main>
  );
}

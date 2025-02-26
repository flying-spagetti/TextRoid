"use client"
import Image from "next/image";
import { Icons } from "@/components/ui/icons";
import { HeroWithMockup } from "@/components/hero-with-mockup";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { CTA } from "@/components/CTA";
import Demo from "@/components/Demo";
import About from "@/components/About";
import EvaluationMetrics from "@/components/Stats";
import Footer from "@/components/ui/Footer";

import { LampDemo } from "@/components/ui/lamp";
export default function Home() {
  return (

    <>
    
    <HeroGeometric
    badge="TextRon"
      title1="Text generation made easy"
      title2="With AI"
      
      
      />
      <Demo/>
      <EvaluationMetrics/>
      <CTA/>
      <About/>
      <Footer/>
      
     

    
    </>
  );
}

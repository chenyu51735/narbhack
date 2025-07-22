"use client";

import Hero from "@/components/home/Hero";
import Benefits from "@/components/home/Benefits";
import Testimonials from "@/components/home/Testimonials";
import FooterHero from "@/components/home/FooterHero";
import Footer from "@/components/home/Footer";
import MessagesModal from "@/components/common/MessagesModal";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Hero />
      <Benefits />
      <Testimonials />
      <Footer />
      <MessagesModal />
    </div>
  );
}

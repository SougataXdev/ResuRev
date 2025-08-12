import type { Route } from "./+types/home";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import Footer from "../components/landing/Footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResuRev - AI-Powered Resume Review" },
    { name: "description", content: "Get instant AI-powered feedback on your resume. Improve your chances of landing your dream job with our advanced resume reviewer." },
  ];
}

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </>
  );
}


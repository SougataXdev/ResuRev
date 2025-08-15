import { Link } from "react-router";
import { Button } from "../ui/button";
import Navigation from "../Navigation";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { BackgroundShapes } from "../ui/shapeBackground";

export default function Hero() {
  return (
    <main className="relative">
      <Navigation />
      <BackgroundShapes />
      <section className="main-section flex flex-col min-h-screen items-center pt-32 md:pt-60 gap-6 md:gap-10 relative z-10 px-4 md:px-0">
        <div className="relative z-20 flex flex-col items-center gap-6 md:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-2 md:mb-4 px-3 md:px-4 py-1 md:py-1.2 rounded-full glass"
          >
            <button className="text-primary text-sm md:text-base">
              <ClipboardList className="w-4 h-4 inline-block mr-2 mb[2px] text-primary" />
              AI-powered Resume Reviewer
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="page-heading max-w-7xl text-center flex flex-col items-center px-4"
          >
            <h1 className="heading max-w-6xl text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/50">
              Land Your Dream Job with a Flawless Resume
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-muted dark:text-muted-foreground/80 max-w-4xl text-center text-lg md:text-xl tracking-tight pt-2 md:pt-3 px-4"
          >
            Get instant, AI-driven feedback that sharpens your phrasing, fixes
            formatting, and optimizes for ATS. Actionable, prioritized
            suggestions so recruiters notice you{" "}
            <span className="hidden md:inline">
              <br /> — ready in seconds.
            </span>
            <span className="md:hidden"> — ready in seconds.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="px-4"
          >
            <Link to="/upload">
              <Button className="mt-2 bg-primary/90 hover:bg-primary/70 text-sm md:text-base px-6 md:px-8 py-2.5 md:py-3">
                Upload Your Resume Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

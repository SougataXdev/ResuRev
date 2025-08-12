import { motion } from "framer-motion";
import type React from "react";

export default function AnimatedSection({ children }: React.PropsWithChildren<{}>, delay = 0) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }} 
      // amount: 0.5 means animation starts when 50% of the section is visible
      transition={{ delay, duration: 0.8, ease: "easeIn" }}
    >
      {children}
    </motion.div>
  );
}

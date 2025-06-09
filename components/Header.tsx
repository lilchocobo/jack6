"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut",
        delay: 0.2
      }}
      whileHover={{ rotate: [0, 10, -10, 10, -10, 0], transition: { duration: 0.5 } }}
      className="flex justify-center items-end relative"
    >
      <Image
        src="/jackpotlogo.png"
        alt="JACKPOT"
        width={168}  // 80% of 210
        height={50}  // 80% of 63
        className="object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] relative"
        priority
      />
    </motion.div>
  );
}
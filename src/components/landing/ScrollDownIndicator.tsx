'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import React from 'react'

export default function ScrollDownIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <ChevronDown size={32} className="text-accent" />
    </motion.div>
  )
}

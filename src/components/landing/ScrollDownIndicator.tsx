'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import React from 'react'

export default function ScrollDownIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 -translate-x-1/2"
      animate={{ y: [0, 20, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <ChevronDown size={72} className="text-accent" />
    </motion.div>
  )
}

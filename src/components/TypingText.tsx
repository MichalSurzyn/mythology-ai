'use client'

import { motion, easeOut } from 'framer-motion'
import React from 'react'

interface TypingTextProps {
  text: string // Tekst do wyświetlenia
  className?: string // Klasy CSS do stylizacji
  delay?: number // Opcjonalne opóźnienie przed rozpoczęciem animacji
}

const TypingText: React.FC<TypingTextProps> = ({
  text,
  className,
  delay = 0.3,
}) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay },
    },
  }

  const child = {
    hidden: { opacity: 0, x: -5, rotate: -5 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { duration: 0.4, ease: easeOut },
    },
  }

  // Zamiana 4 spacji na znacznik <br />
  const formattedText = text.split('  ')

  return (
    <motion.p
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        wordBreak: 'normal', // Zapobiega łamaniu słów w połowie
        overflowWrap: 'break-word', // Łamie linie tylko na końcu słowa
        whiteSpace: 'normal', // Umożliwia łamanie linii
      }}
    >
      {formattedText.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={child}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal', // Zachowanie spacji
              }}
            >
              {char}
            </motion.span>
          ))}
          {index < formattedText.length - 1 && <br />}
        </React.Fragment>
      ))}
    </motion.p>
  )
}

export default TypingText

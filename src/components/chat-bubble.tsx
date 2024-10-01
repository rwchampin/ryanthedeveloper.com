'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, RotateCcw, StopCircle, Edit, Trash2, ThumbsUp, ThumbsDown, Smile } from 'lucide-react'

type ButtonType = {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

type ChatBubbleProps = {
  type: 'user' | 'assistant'
  content: string
  buttons?: ButtonType[]
}

const analyzeText = (text: string): ButtonType[] => {
  // This is a placeholder function. In a real-world scenario, you'd implement
  // more sophisticated text analysis here.
  const buttons: ButtonType[] = []
  
  if (text.toLowerCase().includes('happy')) {
    buttons.push({ icon: <ThumbsUp size={16} />, label: 'Like', onClick: () => console.log('Liked') })
  }
  if (text.toLowerCase().includes('sad')) {
    buttons.push({ icon: <ThumbsDown size={16} />, label: 'Dislike', onClick: () => console.log('Disliked') })
  }
  if (text.length > 100) {
    buttons.push({ icon: <Smile size={16} />, label: 'Summarize', onClick: () => console.log('Summarize') })
  }
  
  return buttons
}

export function ChatBubble({ type, content, buttons: propButtons }: ChatBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [buttons, setButtons] = useState<ButtonType[]>([])

  useEffect(() => {
    if (type === 'assistant') {
      const analyzedButtons = analyzeText(content)
      setButtons(propButtons || analyzedButtons)
    }
  }, [type, content, propButtons])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`relative max-w-[80%] ${type === 'user' ? 'ml-auto' : 'mr-auto'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`p-4 rounded-lg shadow-lg ${
          type === 'user' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <p className="mb-2">{content}</p>
        {type === 'assistant' && buttons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200"
          >
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {button.icon}
                {button.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-0 ${
              type === 'user' ? 'left-0 translate-x-[-120%]' : 'right-0 translate-x-[120%]'
            } flex gap-2`}
          >
            {type === 'assistant' ? (
              <>
                <button className="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                  <StopCircle size={16} />
                </button>
                <button className="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                  <Copy size={16} />
                </button>
                <button className="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                  <RotateCcw size={16} />
                </button>
              </>
            ) : (
              <>
                <button className="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                  <Edit size={16} />
                </button>
                <button className="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                  <Copy size={16} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 right-0 p-1 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors translate-x-1/2 -translate-y-1/2"
          >
            <Trash2 size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
"use client"

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { FaGripVertical } from "react-icons/fa";
import { useEffect, useState } from "react";
import { FaBriefcase, FaCalendarDays, FaPaperclip } from "react-icons/fa6";
import { createClient } from "@/lib/utils/supabase/client";
import  Chat from "@/app/admin/ai/assistants/chat";
import { useControls } from "leva";
const greet = (user) => {
  const date = new Date();
  const hours = date.getHours();
  const name = user?.name.split(" ")[0];
  const words = () => {
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return `${words()}, ${name}`;
};

export function Jarvis() {
  const supabase = createClient();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState("default");

  const handleDragStart = (event) => {
    setIsDragging(true);
    setPosition({ x: event.clientX, y: event.clientY });
  };
  const handleDragEnd = (event) => {
    setIsDragging(false);
    setPosition({ x: event.clientX, y: event.clientY });
  };
  const handleDrag = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  const show = (boo) => setIsActive(boo);

  const animations = {
    enter: {
      initial: { opacity: 0, y: 20, right: '20px', bottom: '20px' },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    actionMode: {
      initial: { width: 100, height: 100 ,right: '20px', bottom: '50px' },
      animate: { width: 600, height: window.innerHeight - 100, top: '50%', right: '50%', x: '-50%', y: '-50%' },
      exit: { width: 100, height: 100 },
    },
  };

  const actions = [
    {
      action: "Generate Product",
      description: "Generate a new product",
      icon: <FaBriefcase />,
      onClick: () => {
        setMode("action");
      },
    },
    {
      action: "Crawl For Data",
      description: "Crawl for data",
      icon: <FaCalendarDays />,
    },
    {
      action: "Create Post",
      description: "Create a new post",
      icon: <FaPaperclip />,
    },
  ];

  const constraints = useControls({
    top: { value: 0, min: -window.innerHeight, max: window.innerHeight },
    bottom: { value: window.innerHeight, min:-window.innerWidth, max: window.innerHeight },
    left: { value: 0, min: -window.innerWidth, max: window.innerWidth },
    right: { value: window.innerWidth, min: -window.innerWidth, max: window.innerWidth },
  });
  return (
    <motion.div
      initial={animations.enter.initial}
      animate={animations.enter.animate}
      exit={animations.enter.exit}
      drag
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed z-[99999999] bottom-4 right-4"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      dragConstraints={{ 
        top: constraints.top, 
        bottom: constraints.bottom, 
        left: constraints.left, 
        right: constraints.right 
      }}
    >
      <AnimatePresence>
        {isOpen ? (
          <motion.nav
            key="open"
            initial={mode === "action" ? animations.actionMode.initial : { opacity: 0, scale: 0.8 }}
            animate={mode === "action" ? animations.actionMode.animate : { opacity: 1, scale: 1 }}
            exit={mode === "action" ? animations.actionMode.exit : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`bg-[#1e1e1e] text-white rounded-xl shadow-lg h-full ${
              isDragging ? "shadow-[0_10px_30px_rgba(0,0,0,0.5)]" : "shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            }`}
           dragConstraints={{
  left: -250, // Adjust the value based on the width of the element
  right:250, // Adjust the value based on the width of the element
  top: -300, // Adjust the value based on the height of the element
  bottom: -300, // Adjust the value based on the height of the element
}}
            style={mode === "action" ? { width: 400, height: 600 } : { width: 500 }}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Jarvis</h3>
                <div className="flex items-center">
                  <FaGripVertical className="size-1 mr-2 text-gray-400" />
                  <ImageIcon className="size-1 mr-2 text-gray-400" />
                  <MicIcon className="size-1 mr-2 text-gray-400" />
                  <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <MinusIcon className="w-5 h-5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <XIcon className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.nav>
        ) : (
          <motion.button
            key="closed"
            onClick={() => setIsOpen(true)}
            className="bg-[#1e1e1e] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
 

function ImageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function LightbulbIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function MicIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function MinusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
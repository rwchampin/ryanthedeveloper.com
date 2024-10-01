"use client";
import {
  HiOutlinePaperClip,
} from "react-icons/hi2";
import { FaHeadphones } from "react-icons/fa";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";

const actionButtons = [
  "Summarize", "Translate", "Explain", "Rephrase", "Analyze", "Generate", "Compare", "Predict"
];

function useScrollGradient(ref: React.RefObject<HTMLElement>) {
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
    };

    element.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => element.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return { showLeftGradient, showRightGradient };
}

const Particle = ({ x, y }: { x: number; y: number }) => (
  <motion.div
    className="absolute w-2 h-2 bg-[#333] rounded-full"
    initial={{ x, y }}
    animate={{
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      opacity: 0,
    }}
    transition={{ duration: 0.5 }}
  />
);

export function SmartInput({
  type,
  value,
  onChange,
  className,
  disabled,
  onSubmit,
  ...props
}: any) {
  const [images, setImages] = useState<string[]>(["/placeholder.svg?height=40&width=40"]);
  const [selectedText, setSelectedText] = useState("");
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showLeftGradient, showRightGradient } = useScrollGradient(scrollRef);

  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files) {
  //     const newImages = Array.from(files).map(file => URL.createObjectURL(file));
  //     setImages(prev => [...prev, ...newImages]);
  //   }
  // };

  // const handleSubmit = () => {
  //   console.log("Submitted:", value);
  //   onChange({ target: { value: "" } }); // Clear input after submit
  // };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSubmit();
  //   }
  // };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText) {
      setSelectedText(selectedText);
    }
  };

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setParticles(prev => [...prev, { id: Date.now(), x, y }]);
    setTimeout(() => setParticles(prev => prev.slice(1)), 500);
  };

  // useEffect(() => {
  //   const textarea = textareaRef.current;
  //   if (textarea) {
  //     textarea.addEventListener('mouseup', handleTextSelection);
  //     textarea.addEventListener('keyup', handleTextSelection);
  //   }
  //   return () => {
  //     if (textarea) {
  //       textarea.removeEventListener('mouseup', handleTextSelection);
  //       textarea.removeEventListener('keyup', handleTextSelection);
  //     }
  //   };
  // }, []);

  return (
    <div className="w-full mx-auto space-y-2 bg-gray-900 rounded-xl shadow-lg text-gray-100">
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border border-gray-700 bg-gray-800">
          <div ref={scrollRef} className="flex w-max space-x-4 p-4">
            {actionButtons.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.6, -0.05, 0.01, 0.99]
                }}
              >
                <Button
                  variant="outline"
                  className="shadow-md hover:shadow-lg transition-shadow bg-gray-700 text-gray-100 border-gray-600"
                  // onClick={handleActionClick}

                  disabled={disabled}
                  type="submit"
                >
                  {action}
                </Button>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {showLeftGradient && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none z-10" />
        )}
        {showRightGradient && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none z-10" />
        )}
      </div>

      <div className="relative">
        <div className="absolute left-[44px] top-[77%] -translate-x-full -translate-y-1/2 px-3">
          <label htmlFor="file-upload" className="cursor-pointer">
            <HiOutlinePaperClip className="h-6 w-6 text-gray-400 hover:text-gray-200 transition-colors" />
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            // onChange={handleImageUpload}
          />
        </div>

        <input
          type="text"
          // ref={textareaRef}
          value={value}
          onChange={onChange}
          // onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your message here..."
          className="min-h-[100px] resize-none pr-12 pl-4 shadow-inner rounded-lg focus:ring-2 focus:ring-#333 transition-shadow bg-gray-800 text-gray-100 border-gray-700 w-full"
        />
        <div className="absolute right-3 bottom-3 flex space-x-2 items-center">
          <FaMicrophone
            className="h-6 w-6 text-gray-400 hover:text-gray-200 transition-colors" />
            <Button type="submit" variant="outline" className="bg-gray-700 text-gray-100 border-gray-600"> 
          <IoIosSend
            className="h-6 w-6 text-#333 hover:text-#333 transition-colors cursor-pointer"
            // onClick={handleSubmit}
          />
          </Button>

          <span className="text-[10px] text-gray-400">{value.length} / 2000</span>
        </div>
      </div>

      <AnimatePresence>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-end space-x-2"
          >
            <Button size="sm" variant="outline" className="bg-gray-700 text-gray-100 border-gray-600">Create Action</Button>
            <Button size="sm" variant="outline" className="bg-gray-700 text-gray-100 border-gray-600">Assistant Rephrase</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* <div className="flex -space-x-2 overflow-hidden">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Uploaded preview ${i + 1}`}
            className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-800 shadow-md transition-transform hover:scale-110"
          />
        ))}
      </div> */}

      {particles.map(particle => (
        <Particle key={particle.id} x={particle.x} y={particle.y} />
      ))}
    </div>
  );
}
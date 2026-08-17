'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Paperclip, Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from './Message';
import { ChatHistory } from './ChatHistory';
import { SuggestedQuestions } from './SuggestedQuestions';
import { BackgroundPaths } from './BackgroundPaths';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  accentColor: string;
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
}

interface CourseChatWindowProps {
  courseId?: string;
  chapterId?: string;
}

const chatHistory = [
  { id: 1, title: "Introduction to React", date: "2024-02-07" },
  { id: 2, title: "JavaScript Basics", date: "2024-02-06" },
  { id: 3, title: "CSS Fundamentals", date: "2024-02-05" },
];

const suggestedQuestions = [
  "How do React components work?",
  "What are React hooks?",
  "Explain the virtual DOM",
  "What is JSX?",
  "How does state management work?",
  "What are props in React?",
  "Explain useEffect",
  "What is Context API?",
];

const botResponses = [
  "I'd be happy to help you understand React components.",
  "Let me explain how state management works in React.",
  "Here's what you need to know about React hooks.",
  "The virtual DOM is a key concept in React. Let me explain.",
  "Props and state are fundamental to React. Here's how they work.",
];

// Sample courses data
const courses: Course[] = [
  {
    id: "react",
    title: "React Fundamentals",
    modules: [
      { id: "react-1", title: "Getting Started" },
      { id: "react-2", title: "Components & Props" },
      { id: "react-3", title: "State & Lifecycle" },
    ]
  },
  {
    id: "javascript",
    title: "JavaScript Essentials",
    modules: [
      { id: "js-1", title: "Basic Concepts" },
      { id: "js-2", title: "Functions & Objects" },
      { id: "js-3", title: "Async Programming" },
    ]
  },
  {
    id: "python",
    title: "Python for Beginners",
    modules: [
      { id: "py-1", title: "Python Basics" },
      { id: "py-2", title: "Data Structures" },
      { id: "py-3", title: "Functions & Modules" },
    ]
  },
];

export function CourseChatWindow({ courseId, chapterId }: CourseChatWindowProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialState, setIsInitialState] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [selectedModule, setSelectedModule] = useState(courses[0].modules[0]);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const moduleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize with welcome message when course/chapter changes
  useEffect(() => {
    let welcomeMessage = "Hi there! I'm your AI learning assistant. How can I help you today?";
    
    if (courseId && chapterId) {
      welcomeMessage = `Welcome to this chapter! I'm your AI tutor and I'll guide you through the learning material. Feel free to ask me any questions about the topic.`;
      
      // Simulate chapter-specific content message
      const contentMessage: ChatMessage = {
        id: '2',
        content: "Let's start by understanding the key concepts in this chapter. What specific aspect would you like to explore first?",
        isUser: false,
        accentColor: "var(--primary)",
      };
      
      setMessages([
        {
          id: '1',
          content: welcomeMessage,
          isUser: false,
          accentColor: "var(--primary)",
        },
        contentMessage
      ]);
    } else {
      setMessages([
        {
          id: '1',
          content: welcomeMessage,
          isUser: false,
          accentColor: "var(--primary)",
        }
      ]);
    }
  }, [courseId, chapterId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getRandomResponse = () => {
    return botResponses[Math.floor(Math.random() * botResponses.length)];
  };

  const handleSendMessage = (text = inputMessage) => {
    if (text.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: text,
        isUser: true,
        accentColor: "var(--primary)",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsInitialState(false);

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: getRandomResponse(),
          isUser: false,
          accentColor: "var(--primary)",
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCourseChange = (course: Course) => {
    setSelectedCourse(course);
    setSelectedModule(course.modules[0]);
    setIsCourseDropdownOpen(false);
  };

  const handleModuleChange = (module: Module) => {
    setSelectedModule(module);
    setIsModuleDropdownOpen(false);
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <BackgroundPaths />
      
      <div className="w-full h-full flex z-10">
        <div 
          className={`flex-1 flex flex-col h-full bg-[var(--background)] ${isHistoryOpen ? 'mr-[320px]' : ''} transition-all duration-300`}
        >
          {/* Course Info Header */}
          <header className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex flex-col">
              {/* Course Selector */}
              <div className="relative inline-block" ref={courseDropdownRef}>
                <button 
                  onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                  className="flex items-center gap-2 text-xl font-bold text-black hover:text-[var(--primary)] transition-colors"
                >
                  {selectedCourse.title}
                  <ChevronDown size={20} className={`transition-transform ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCourseDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-white z-30 border border-gray-200">
                    <div className="py-1">
                      {courses.map(course => (
                        <button
                          key={course.id}
                          className={`block w-full text-left px-4 py-2 text-sm ${course.id === selectedCourse.id ? 'bg-gray-100 text-[var(--primary)]' : 'text-gray-700'} hover:bg-gray-50`}
                          onClick={() => handleCourseChange(course)}
                        >
                          {course.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Module Selector */}
              <div className="relative inline-block mt-1" ref={moduleDropdownRef}>
                <button 
                  onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-[var(--primary)] transition-colors"
                >
                  Module: {selectedModule.title}
                  <ChevronDown size={14} className={`transition-transform ${isModuleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isModuleDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white z-30 border border-gray-200">
                    <div className="py-1">
                      {selectedCourse.modules.map(module => (
                        <button
                          key={module.id}
                          className={`block w-full text-left px-4 py-2 text-sm ${module.id === selectedModule.id ? 'bg-gray-100 text-[var(--primary)]' : 'text-gray-700'} hover:bg-gray-50`}
                          onClick={() => handleModuleChange(module)}
                        >
                          {module.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat History Toggle */}
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors rounded-md hover:bg-gray-100"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              Chat History 
              {isHistoryOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </header>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto" ref={messageContainerRef}>
            <AnimatePresence mode="wait">
              {isInitialState ? (
                <motion.div
                  className="h-full flex flex-col items-center justify-center px-6"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -30,
                    transition: { duration: 1, ease: "easeInOut" },
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <motion.h2
                    className="text-3xl font-bold mb-4 text-[var(--primary)]"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 1.2 }}
                  >
                    What would you like to learn?
                  </motion.h2>

                  <SuggestedQuestions 
                    questions={suggestedQuestions} 
                    onQuestionClick={handleSendMessage} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="py-6 px-4 flex flex-col gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {messages.map((message) => (
                    <Message 
                      key={message.id} 
                      content={message.content} 
                      isUser={message.isUser}
                      accentColor={message.accentColor} 
                    />
                  ))}
                  <div ref={endOfMessagesRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 bg-white rounded-xl p-2 border border-gray-200">
              <button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add attachment"
              >
                <Paperclip size={20} />
              </button>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none outline-none text-sm min-h-[24px] max-h-[120px] py-2"
                rows={1}
              />
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add emoji"
              >
                <Smile size={20} />
              </button>
              <button
                className={`p-2 rounded-lg flex items-center justify-center ${inputMessage.trim() 
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat History Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full w-[320px] bg-[var(--primary)] text-white shadow-lg border-l border-white/10 transform transition-transform duration-300 z-20 ${
            isHistoryOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ChatHistory chats={chatHistory} />
        </div>
      </div>
    </div>
  );
}

export default CourseChatWindow; 
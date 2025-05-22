// File: c:\Users\PMYLS\Desktop\Mahendar Website\Mahendar Website\Clone-childrens-website\childrens-clone\src\components\Header.tsx
// Or wherever your navigation component is located

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // INCREASE THIS VALUE to keep dropdown open longer
  const CLOSE_DELAY = 1000; // 1000ms = 1 second (adjust as needed)
  
  const handleMouseEnter = (dropdownName: string) => {
    // Clear any existing timeout to prevent closing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdown(dropdownName);
  };
  
  const handleMouseLeave = (dropdownName: string) => {
    // Set timeout to close dropdown after delay
    timeoutRef.current = setTimeout(() => {
      if (openDropdown === dropdownName) {
        setOpenDropdown(null);
      }
    }, CLOSE_DELAY); // Use our longer delay
  };
  
  return (
    <header className="bg-gradient-to-r from-purple-500 to-pink-500">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-white">Kids Zone</Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-white/80">Home</Link>
            
            {/* Stories by Age Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => handleMouseEnter('stories')}
              onMouseLeave={() => handleMouseLeave('stories')}
            >
              <button className="flex items-center text-white hover:text-white/80">
                Stories by Age
                <svg className="ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {openDropdown === 'stories' && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/stories?age=0-3" className="block px-4 py-2 text-gray-800 hover:bg-purple-100">Ages 0-3</Link>
                  <Link to="/stories?age=3-6" className="block px-4 py-2 text-gray-800 hover:bg-purple-100">Ages 3-6</Link>
                  <Link to="/stories?age=6-9" className="block px-4 py-2 text-gray-800 hover:bg-purple-100">Ages 6-9</Link>
                  <Link to="/stories?age=9-12" className="block px-4 py-2 text-gray-800 hover:bg-purple-100">Ages 9-12</Link>
                </div>
              )}
            </div>
            
            <Link to="/popular-stories" className="text-white hover:text-white/80">Popular Stories</Link>
            
            {/* Code Stories Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => handleMouseEnter('code')}
              onMouseLeave={() => handleMouseLeave('code')}
            >
              <button className="flex items-center text-white hover:text-white/80">
                Code Stories
                <svg className="ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {openDropdown === 'code' && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    to="/code-stories" 
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-100"
                    onClick={() => setOpenDropdown(null)}
                  >
                    All Code Tutorials
                  </Link>
                  <Link 
                    to="/code-stories?lang=html" 
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-100"
                    onClick={() => setOpenDropdown(null)}
                  >
                    HTML
                  </Link>
                  <Link 
                    to="/code-stories?lang=javascript" 
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-100"
                    onClick={() => setOpenDropdown(null)}
                  >
                    JavaScript
                  </Link>
                  <Link 
                    to="/code-stories?lang=css" 
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-100"
                    onClick={() => setOpenDropdown(null)}
                  >
                    CSS
                  </Link>
                  <Link 
                    to="/code-stories?lang=python" 
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-100"
                    onClick={() => setOpenDropdown(null)}
                  >
                    Python
                  </Link>
                </div>
              )}
            </div>
            
            <Link to="/for-parents" className="text-white hover:text-white/80">For Parents</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
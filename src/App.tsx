import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useParams } from "react-router-dom";
import { StorySection } from "./components/StorySection";
import { StoryDetail } from "./components/StoryDetail";
import { VideoSection } from "./components/VideoSection";
import { VideoDetail } from "./components/VideoDetail";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./lib/firebase";
import { Timestamp } from "firebase/firestore";
import "./animations.css";

// Inner component that can use router hooks
function AdminLoginHandler({ 
  isOpen, 
  onClose,
  onLoginSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onLoginSuccess: () => void;
}) {
  const handleAdminLogin = (password: string) => {
    if (password === "admin123") {
      // Call the parent's success callback instead of using local state
      onLoginSuccess();
      onClose();
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <AdminLoginModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleAdminLogin}
    />
  );
}

function App() {
  const [storiesDropdownOpen, setStoriesDropdownOpen] = useState(false);
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminPanelVisible, setAdminPanelVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const storiesDropdownTimer = React.useRef<number | null>(null);
  const codeDropdownTimer = React.useRef<number | null>(null);

  useEffect(() => {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      img.classList.add("fade-in-animation");
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Show loading state
    setShowSearchResults(true);
    setSearchResults([{ id: "loading", type: "loading", title: "Searching..." }]);
    
    try {
      const searchTermLower = searchQuery.toLowerCase();
      const allResults: any[] = [];
      
      // STORIES SEARCH - Search in multiple fields
      const storySnapshot = await getDocs(collection(db, "stories"));
      
      storySnapshot.forEach((doc) => {
        const data = doc.data();
        const title = (data.title || "").toLowerCase();
        const description = (data.description || "").toLowerCase();
        const content = (data.content || "").toLowerCase();
        
        // Check if any field contains the search term
        if (
          title.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          content.includes(searchTermLower)
        ) {
          allResults.push({ 
            id: doc.id, 
            type: "story", 
            matchField: title.includes(searchTermLower) ? "title" : 
                        description.includes(searchTermLower) ? "description" : "content",
            ...data 
          });
        }
      });
      
      // VIDEOS SEARCH - Search in multiple fields
      const videoSnapshot = await getDocs(collection(db, "videos"));
      
      videoSnapshot.forEach((doc) => {
        const data = doc.data();
        const title = (data.title || "").toLowerCase();
        const description = (data.description || "").toLowerCase();
        
        // Check if any field contains the search term
        if (
          title.includes(searchTermLower) ||
          description.includes(searchTermLower)
        ) {
          allResults.push({ 
            id: doc.id, 
            type: "video", 
            matchField: title.includes(searchTermLower) ? "title" : "description",
            ...data 
          });
        }
      });
      
      // POEMS SEARCH (if you have a poems collection)
      try {
        const poemsSnapshot = await getDocs(collection(db, "poems"));
        
        poemsSnapshot.forEach((doc) => {
          const data = doc.data();
          const title = (data.title || "").toLowerCase();
          const content = (data.content || "").toLowerCase();
          
          if (
            title.includes(searchTermLower) ||
            content.includes(searchTermLower)
          ) {
            allResults.push({ 
              id: doc.id, 
              type: "poem", 
              matchField: title.includes(searchTermLower) ? "title" : "content",
              ...data 
            });
          }
        });
      } catch (error) {
        // Ignore errors if poems collection doesn't exist
        console.log("No poems collection found or error searching poems");
      }
      
      // Sort results by relevance (title matches first, then description, then content)
      allResults.sort((a, b) => {
        // Title matches come first
        if (a.matchField === "title" && b.matchField !== "title") return -1;
        if (a.matchField !== "title" && b.matchField === "title") return 1;
        
        // Then description matches
        if (a.matchField === "description" && b.matchField === "content") return -1;
        if (a.matchField === "content" && b.matchField === "description") return 1;
        
        // Otherwise, sort by type for grouping
        return a.type.localeCompare(b.type);
      });
      
      setSearchResults(allResults);
      
      if (allResults.length === 0) {
        console.log("No results found for query:", searchQuery);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([{ id: "error", type: "error", title: "Search failed. Please try again." }]);
    }
  };

  useEffect(() => {
    // Improved keyboard shortcut detection for admin access
    const handleKeyDown = (event: KeyboardEvent) => {
      // Debug logging to see if the key events are being captured
      console.log(`Key pressed: ${event.key}, Ctrl: ${event.ctrlKey}, Alt: ${event.altKey}`);
      
      // In Firefox, pressing Ctrl+Alt+A selects all text, which might interfere
      // preventDefault early to ensure our shortcut works
      if (event.ctrlKey && event.altKey && (event.key.toLowerCase() === 'a')) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log("Admin access triggered!");
        
        // Use a more reliable approach for opening windows
        try {
          const adminWindow = window.open("http://localhost:5173/", "_blank", "noopener,noreferrer");
          
          if (!adminWindow) {
            alert("Popup blocked! Please allow popups for this site.");
          } else {
            adminWindow.focus();
          }
        } catch (error) {
          console.error("Failed to open admin panel:", error);
          alert("Could not open admin panel. Please check the console for details.");
        }
      }
    };
    
    // Use both document and window event listeners for broader compatibility
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  return (
    <BrowserRouter>
      <div
        className="min-h-screen flex flex-col relative"
        style={{
          backgroundImage: "url('/images/Shanti25-500x500.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-0"></div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link to="/" className="block">
                <div className="bg-gray-200 px-8 py-4 rounded">
                  <span className="text-3xl font-bold text-gray-600">Kids Zone</span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <NavLink to="/" className="text-white font-medium hover:text-yellow-200">
                  Home
                </NavLink>

                <div
                  className="relative group"
                  onMouseEnter={() => {
                    setStoriesDropdownOpen(true);
                    setCodeDropdownOpen(false);
                    
                    // Clear existing timer if any
                    if (storiesDropdownTimer.current) {
                      window.clearTimeout(storiesDropdownTimer.current);
                    }
                    
                    // Set new timer to hide dropdown after 4 seconds
                    storiesDropdownTimer.current = window.setTimeout(() => {
                      setStoriesDropdownOpen(false);
                    }, 4000);
                  }}
                  onMouseLeave={() => {
                    // Clear the timer when mouse leaves
                    if (storiesDropdownTimer.current) {
                      window.clearTimeout(storiesDropdownTimer.current);
                      storiesDropdownTimer.current = null;
                    }
                    setStoriesDropdownOpen(false);
                  }}
                >
                  <button className="text-white font-medium hover:text-yellow-200 flex items-center">
                    Stories by Age
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {storiesDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                      <div className="py-2 px-4">
                        <Link
                          to="/poems"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setStoriesDropdownOpen(false)}
                        >
                          Kids Poems
                        </Link>
                        <Link
                          to="/stories/0-3"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setStoriesDropdownOpen(false)}
                        >
                          0-3 years
                        </Link>
                        <Link
                          to="/stories/3-6"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setStoriesDropdownOpen(false)}
                        >
                          3-6 years
                        </Link>
                        <Link
                          to="/stories/6-9"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setStoriesDropdownOpen(false)}
                        >
                          6-9 years
                        </Link>
                        <Link
                          to="/stories/9-12"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setStoriesDropdownOpen(false)}
                        >
                          9-12 years
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <NavLink to="/popular" className="text-white font-medium hover:text-yellow-200">
                  Popular Stories
                </NavLink>

                <div
                  className="relative group"
                  onMouseEnter={() => {
                    setCodeDropdownOpen(true);
                    setStoriesDropdownOpen(false);
                    
                    // Clear existing timer if any
                    if (codeDropdownTimer.current) {
                      window.clearTimeout(codeDropdownTimer.current);
                    }
                    
                    // Set new timer to hide dropdown after 4 seconds
                    codeDropdownTimer.current = window.setTimeout(() => {
                      setCodeDropdownOpen(false);
                    }, 4000);
                  }}
                  onMouseLeave={() => setCodeDropdownOpen(false)}
                >
                  <button className="text-white font-medium hover:text-yellow-200 flex items-center">
                    Code Stories
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {codeDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                      <div className="py-2 px-4">
                        <Link
                          to="/code/html"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setCodeDropdownOpen(false)}
                        >
                          HTML Stories
                        </Link>
                        <Link
                          to="/code/css"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setCodeDropdownOpen(false)}
                        >
                          CSS Stories
                        </Link>
                        <Link
                          to="/code/javascript"
                          className="block py-2 text-purple-800 hover:text-purple-600"
                          onClick={() => setCodeDropdownOpen(false)}
                        >
                          JavaScript Stories
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <NavLink to="/parents" className="text-white font-medium hover:text-yellow-200">
                  For Parents
                </NavLink>

                <div className="relative">
                  <button
                    onClick={() => {
                      setSearchOpen(!searchOpen);
                      if (!searchOpen) {
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }
                    }}
                    className="text-white hover:text-yellow-200 transition-colors duration-200 transform hover:scale-110"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  
                  {searchOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50">
                      <form onSubmit={(e) => {
                        handleSearch(e);
                        setShowSearchResults(true);
                      }} className="p-4">
                        <div className="flex">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search stories and videos..."
                            className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            type="submit"
                            className="bg-purple-600 text-white p-2 rounded-r hover:bg-purple-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </button>
                        </div>
                      </form>
                      
                      {/* Search Results Display */}
                      {showSearchResults && (
                        <div className="max-h-80 overflow-y-auto p-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-purple-900">Search Results</h3>
                            <button 
                              onClick={() => {
                                setSearchResults([]);
                                setSearchQuery("");
                                setShowSearchResults(false);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Clear
                            </button>
                          </div>
                          
                          {/* Loading state */}
                          {searchResults.length === 1 && searchResults[0].type === "loading" && (
                            <div className="text-center py-4">
                              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                              <p className="mt-2 text-gray-600">Searching...</p>
                            </div>
                          )}
                          
                          {/* Error state */}
                          {searchResults.length === 1 && searchResults[0].type === "error" && (
                            <div className="text-center py-4 text-red-500">
                              {searchResults[0].title}
                            </div>
                          )}
                          
                          {/* No results */}
                          {searchResults.length === 0 && (
                            <p className="text-gray-500 text-sm">No results found. Try different keywords.</p>
                          )}
                          
                          {/* Results grouped by type */}
                          {searchResults.length > 0 && searchResults[0].type !== "loading" && searchResults[0].type !== "error" && (
                            <div>
                              {/* Group and display stories */}
                              {searchResults.some(result => result.type === "story") && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-sm text-purple-800 mb-2">Stories</h4>
                                  <ul className="space-y-3">
                                    {searchResults
                                      .filter(result => result.type === "story")
                                      .map((result) => (
                                      <li key={result.id} className="border-b border-gray-100 pb-2">
                                        <Link
                                          to={`/story/${result.id}`}
                                          className="block hover:bg-gray-50 p-2 rounded"
                                          onClick={() => setSearchOpen(false)}
                                        >
                                          <div className="flex items-center">
                                            {result.coverImageUrl ? (
                                              <img 
                                                src={result.coverImageUrl || "https://placehold.co/400x300?text=Story"} 
                                                alt={result.title}
                                                className="w-12 h-12 object-cover rounded mr-3" 
                                              />
                                            ) : (
                                              <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                                <span className="text-xl">📚</span>
                                              </div>
                                            )}
                                            <div>
                                              <h4 className="font-semibold text-purple-900">{result.title}</h4>
                                              <p className="text-xs text-gray-600">
                                                {result.ageGroup} years • {result.matchField === "title" ? "Title match" : 
                                                  result.matchField === "description" ? "Description match" : "Content match"}
                                              </p>
                                            </div>
                                          </div>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Group and display videos */}
                              {searchResults.some(result => result.type === "video") && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-sm text-purple-800 mb-2">Videos</h4>
                                  <ul className="space-y-3">
                                    {searchResults
                                      .filter(result => result.type === "video")
                                      .map((result) => (
                                      <li key={result.id} className="border-b border-gray-100 pb-2">
                                        <Link
                                          to={`/video/${result.id}`}
                                          className="block hover:bg-gray-50 p-2 rounded"
                                          onClick={() => setSearchOpen(false)}
                                        >
                                          <div className="flex items-center">
                                            {result.thumbnailUrl ? (
                                              <img 
                                                src={result.thumbnailUrl || "https://placehold.co/400x300?text=Video"} 
                                                alt={result.title}
                                                className="w-12 h-12 object-cover rounded mr-3" 
                                              />
                                            ) : (
                                              <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                                <span className="text-xl">🎬</span>
                                              </div>
                                            )}
                                            <div>
                                              <h4 className="font-semibold text-purple-900">{result.title}</h4>
                                              <p className="text-xs text-gray-600">
                                                Video • {result.matchField === "title" ? "Title match" : "Description match"}
                                              </p>
                                            </div>
                                          </div>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Group and display poems */}
                              {searchResults.some(result => result.type === "poem") && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-sm text-purple-800 mb-2">Poems</h4>
                                  <ul className="space-y-3">
                                    {searchResults
                                      .filter(result => result.type === "poem")
                                      .map((result) => (
                                      <li key={result.id} className="border-b border-gray-100 pb-2">
                                        <Link
                                          to={`/poem/${result.id}`}
                                          className="block hover:bg-gray-50 p-2 rounded"
                                          onClick={() => setSearchOpen(false)}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                              <span className="text-xl">📝</span>
                                            </div>
                                            <div>
                                              <h4 className="font-semibold text-purple-900">{result.title}</h4>
                                              <p className="text-xs text-gray-600">
                                                Poem • {result.matchField === "title" ? "Title match" : "Content match"}
                                              </p>
                                            </div>
                                          </div>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </header>

          <main className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <section className="py-16 relative">
                      <div className="absolute inset-0 bg-white/50 z-0"></div>

                      <div className="container mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold text-indigo-900 mb-4">Reading for all!</h1>
                        <p className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto">
                          Discover the world of books and stories with Epic.<br />
                          Perfect for educators, families, and kids alike.
                        </p>
                        <div className="flex justify-center gap-4">
                          <a
                            href="#"
                            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700"
                          >
                            For Educators
                          </a>
                          <a
                            href="#"
                            className="px-8 py-3 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600"
                          >
                            For Families
                          </a>
                        </div>
                      </div>
                    </section>

                    <section className="py-12">
                      <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-10 text-purple-900">Trending Stories</h2>
                        <StorySection ageGroup="0-3" title="For Toddlers" />
                        <StorySection ageGroup="3-6" title="For Preschoolers" />
                        <VideoSection title="Featured Videos" />
                      </div>
                    </section>
                  </>
                }
              />

              <Route
                path="/popular"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Popular Stories</h1>
                      <StorySection ageGroup="all" title="Popular Stories for All Ages" />
                    </div>
                  </div>
                }
              />

              <Route
                path="/poems"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Kids Poems</h1>
                      <p className="text-center mb-8">Coming soon! Check back for our collection of poems for children.</p>
                    </div>
                  </div>
                }
              />

              <Route
                path="/code/:language"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">
                        {useParams<{ language: string }>().language === "html" && "HTML Stories"}
                        {useParams<{ language: string }>().language === "css" && "CSS Stories"}
                        {useParams<{ language: string }>().language === "javascript" && "JavaScript Stories"}
                      </h1>
                      <p className="text-center mb-8">Coming soon! Check back for our stories about coding.</p>
                    </div>
                  </div>
                }
              />

              <Route
                path="/parents"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">For Parents</h1>
                      <div className="max-w-3xl mx-auto prose">
                        <p>Welcome parents! This section provides resources to help you guide your child's reading journey.</p>
                        <h2>Benefits of Reading for Children</h2>
                        <ul>
                          <li>Improves language and literacy skills</li>
                          <li>Enhances concentration and critical thinking</li>
                          <li>Stimulates imagination and creativity</li>
                          <li>Builds empathy and emotional intelligence</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                }
              />

              <Route
                path="/stories/:ageGroup"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Stories by Age</h1>
                      <StorySection ageGroup="0-3" title="Stories for Toddlers (0-3)" />
                      <StorySection ageGroup="3-6" title="Stories for Preschoolers (3-6)" />
                      <StorySection ageGroup="6-9" title="Stories for Early Readers (6-9)" />
                      <StorySection ageGroup="9-12" title="Stories for Middle Graders (9-12)" />
                    </div>
                  </div>
                }
              />

              <Route path="/story/:id" element={<StoryDetail />} />

              <Route
                path="/videos"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Videos</h1>
                      <VideoSection title="Videos for Toddlers" ageGroup="0-3" />
                      <VideoSection title="Videos for Preschoolers" ageGroup="3-6" />
                      <VideoSection title="Videos for Early Readers" ageGroup="6-9" />
                      <VideoSection title="Videos for Middle Graders" ageGroup="9-12" />
                    </div>
                  </div>
                }
              />

              <Route path="/video/:id" element={<VideoDetail />} />

              <Route
                path="/about"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">About Us</h1>
                      <div className="max-w-3xl mx-auto prose">
                        <p>Kids Zone is dedicated to providing engaging educational content for children of all ages...</p>
                      </div>
                    </div>
                  </div>
                }
              />

              <Route
                path="/contact"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Contact Us</h1>
                      <div className="max-w-lg mx-auto">
                        <p className="mb-6 text-center">Have questions or suggestions? We'd love to hear from you!</p>
                        <p className="text-center">
                          Email us at:{" "}
                          <a href="mailto:info@kidzone.com" className="text-blue-600 hover:underline">
                            info@kidzone.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                }
              />

              <Route
                path="/privacy"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Privacy Policy</h1>
                      <div className="max-w-3xl mx-auto prose">
                        <p>Your privacy is important to us...</p>
                      </div>
                    </div>
                  </div>
                }
              />

              <Route
                path="/blog"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Blog</h1>
                      <p className="text-center">Coming soon! Check back for our latest articles.</p>
                    </div>
                  </div>
                }
              />

              <Route
                path="/admin-dashboard"
                element={
                  <AdminDashboard />
                }
              />

              <Route
                path="/control-panel-access"
                element={
                  <div className="py-12">
                    <div className="container mx-auto px-4 max-w-md">
                      <h1 className="text-4xl font-bold mb-10 text-center text-purple-900">Admin Access</h1>
                      
                      <div className="bg-white p-8 rounded-lg shadow-md">
                        <button
                          onClick={() => window.open("http://localhost:5173/", "_blank")}
                          className="w-full bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700"
                        >
                          Open Admin Panel
                        </button>
                      </div>
                    </div>
                  </div>
                }
              />

              <Route path="/code-stories" element={<div>Code Stories Home</div>} />
              <Route path="/code-stories/:language" element={<div>Code Stories by Language</div>} />
            </Routes>
          </main>

          <footer className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-10 relative z-10">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center">
                <img src="/logo.png" alt="Logo" className="h-10 mb-6" />
                <h2 className="text-4xl font-bold mb-6">Stormiz</h2>
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                  <Link to="/about" className="hover:underline">
                    About Us
                  </Link>
                  <Link to="/contact" className="hover:underline">
                    Contact Us
                  </Link>
                  <Link to="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                  <Link to="/blog" className="hover:underline">
                    Blog
                  </Link>
                  <Link to="/poems" className="hover:underline">
                    Poems for Kids
                  </Link>
                </div>
                <div className="mb-4">© 2025 Stormiz — @ByteForge</div>
                <div className="flex gap-4 mb-6">
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-red-300 hover:text-red-100">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
                {/* Removed Admin button as per suggestion */}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Admin Panel Iframe */}
      {/* {adminPanelVisible && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <button 
              onClick={() => setAdminPanelVisible(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Close Admin
            </button>
          </div>
          <div className="flex-grow">
            <iframe
              src="http://localhost:5173/"
              className="w-full h-full border-none"
              title="Admin Panel"
            ></iframe>
          </div>
        </div>
      )} */}
    </BrowserRouter>
  );
}

export default App;

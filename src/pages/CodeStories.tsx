// File: C:\Users\PMYLS\Desktop\Mahendar Website\Mahendar Website\Clone-childrens-website\childrens-clone\src\pages\CodeStories.tsx

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useLocation } from 'react-router-dom';
import { StoryCard } from '../components/StoryCard';

// Define the Story interface
interface Story {
  id: string;
  title: string;
  link?: string;
  ageGroup?: string;
  coverUrl?: string;
  description?: string;
  content?: string;
  category?: string[];
  isCodeStory: boolean;
  programmingLanguage?: string;
  codeSnippet?: string;
  disabled?: boolean;
}

export function CodeStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  
  // Get language from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const languageParam = queryParams.get('lang');
  const [selectedLanguage, setSelectedLanguage] = useState(languageParam || 'all');

  useEffect(() => {
    if (languageParam) {
      setSelectedLanguage(languageParam);
    }
  }, [languageParam]);

  // Define fetchCodeStories outside useEffect so it can be used elsewhere
  const fetchCodeStories = async () => {
    try {
      setLoading(true);
      
      // Get all stories from Firestore
      const storiesRef = collection(db, "stories");
      const querySnapshot = await getDocs(storiesRef);
      
      // Filter stories by isCodeStory
      const codeStories: Story[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isCodeStory === true) {
          codeStories.push({
            id: doc.id,
            ...data
          } as Story);
        }
      });
      
      console.log("All code stories:", codeStories);
      setStories(codeStories);
    } catch (error) {
      console.error("Error fetching code stories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stories based on selected language
  useEffect(() => {
    fetchCodeStories();
  }, []);
  
  // Filter stories based on selected programming language
  const filteredStories = stories.filter(story => {
    if (selectedLanguage === 'all') {
      return true;  // Show all code stories
    }
    
    // Filter by programming language
    return story.programmingLanguage?.toLowerCase() === selectedLanguage.toLowerCase();
  });
  
  // Handle language selection and update URL
  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    
    // Update URL query parameter without full page refresh
    const searchParams = new URLSearchParams(location.search);
    if (lang === 'all') {
        searchParams.delete('lang');
    } else {
        searchParams.set('lang', lang);
    }
    
    // Use history to update URL without refreshing
    window.history.pushState({}, '', 
        `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    );
    
    // Re-fetch stories with the new filter
    fetchCodeStories();
};
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">Code Tutorials</h1>
      
      {/* Programming language filter */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-3">Filter by Language:</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-4 py-2 rounded-full ${
              selectedLanguage === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            All Languages
          </button>
          {['html', 'css', 'javascript', 'python', 'scratch'].map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2 rounded-full ${
                selectedLanguage === lang 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="bg-yellow-50 p-4 mb-6 rounded border border-yellow-200">
          <p className="font-bold">Debug Info:</p>
          <p>Total code stories: {stories.length}</p>
          <p>Filtered stories: {filteredStories.length}</p>
          <p>Selected language: {selectedLanguage}</p>
          <button 
            onClick={fetchCodeStories}
            className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
          >
            Refresh Data
          </button>
        </div>
      )}
      
      {/* Stories grid */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-xl">Loading code stories...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
        </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={story.coverUrl || "/placeholder.jpg"} 
                alt={story.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                }}
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Age Group: {story.ageGroup || 'All ages'}
                </p>
                {story.programmingLanguage && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
                    {story.programmingLanguage}
                  </span>
                )}
                {story.description && (
                  <p className="text-gray-700 mb-4">{story.description}</p>
                )}
                <Link
                  to={`/code-stories/${story.id}`}
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  View Tutorial
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-500 mb-2">No Code Stories Found</h2>
          <p className="text-gray-600">
            {selectedLanguage === 'all' 
              ? "We don't have any coding tutorials yet. Check back soon!" 
              : `We don't have any ${selectedLanguage} tutorials yet. Try another language or check back later!`}
          </p>
        </div>
      )}
    </div>
  );
}
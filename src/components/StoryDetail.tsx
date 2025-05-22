// File: C:\Users\PMYLS\Desktop\Mahendar Website\Mahendar Website\Clone-childrens-website\childrens-clone\src\pages\StoryDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LanguageDropdown } from '../components/LanguageDropdown';

// Define interface for translation structure
interface Translation {
  title?: string;
  description?: string;
  content?: string;
}

// Define interface for story data
interface StoryData {
  id: string;
  title: string;  // Required field per error message
  link?: string;
  ageGroup?: string;
  coverUrl?: string;
  description?: string;
  content?: string;
  translations?: {
    [language: string]: {
      title?: string;
      description?: string;
      content?: string;
    }
  };
  // Add other fields you might need
}

export function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['English']);
  const [translationStatus, setTranslationStatus] = useState<'available' | 'unavailable'>('available');
  
  useEffect(() => {
    const loadStory = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const storyDoc = await getDoc(doc(db, 'stories', id));
        if (storyDoc.exists()) {
          // Cast doc.data() to match your interface
          const storyData: StoryData = { 
            id: storyDoc.id, 
            ...storyDoc.data() as Omit<StoryData, 'id'> 
          };
          setStory(storyData);
          
          // Determine available languages
          const available = ['English']; // Default
          if (storyData.translations) {
            // If there are translations stored, add those languages
            Object.keys(storyData.translations).forEach(lang => {
              if (!available.includes(lang)) {
                available.push(lang);
              }
            });
          }
          setAvailableLanguages(available);
        }
      } catch (error) {
        console.error("Error loading story:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStory();
  }, [id]);
  
  // Check if translation is available when language changes
  useEffect(() => {
    if (!story) return;
    
    if (selectedLanguage === 'English' || 
        (story.translations && story.translations[selectedLanguage])) {
      setTranslationStatus('available');
    } else {
      setTranslationStatus('unavailable');
    }
  }, [selectedLanguage, story]);
  
  // Get content in the selected language
  const getTranslatedContent = () => {
    if (!story) return '';
    
    if (selectedLanguage === 'English') {
      return story.content || '';
    }
    
    if (story.translations && story.translations[selectedLanguage] && 
        story.translations[selectedLanguage].content) {
      return story.translations[selectedLanguage].content;
    }
    
    return story.content || ''; // Fallback to English
  };
  
  // Get title in the selected language
  const getTranslatedTitle = () => {
    if (!story) return '';
    
    if (selectedLanguage === 'English') {
      return story.title;
    }
    
    if (story.translations && story.translations[selectedLanguage] && 
        story.translations[selectedLanguage].title) {
      return story.translations[selectedLanguage].title;
    }
    
    return story.title; // Fallback to English
  };
  
  // Get description in the selected language
  const getTranslatedDescription = () => {
    if (!story) return '';
    
    if (selectedLanguage === 'English') {
      return story.description || '';
    }
    
    if (story.translations && story.translations[selectedLanguage] && 
        story.translations[selectedLanguage].description) {
      return story.translations[selectedLanguage].description;
    }
    
    return story.description || ''; // Fallback to English
  };
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading story...</div>;
  }
  
  if (!story) {
    return <div className="flex justify-center items-center min-h-screen">Story not found</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Language selector - positioned at the top right */}
      <div className="flex justify-end mb-4">
        <LanguageDropdown
          value={selectedLanguage}
          onChange={setSelectedLanguage}
          className="min-w-[150px]"
        />
      </div>
      
      {/* Translation unavailable message */}
      {translationStatus === 'unavailable' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            This story is not available in {selectedLanguage}. Showing English version instead.
          </p>
        </div>
      )}
      
      {/* Story Image */}
      <div className="mb-8">
        <img 
          src={story.coverUrl || "/placeholder-cover.jpg"} 
          alt={getTranslatedTitle()} 
          className="w-full h-auto rounded-lg shadow-md object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-cover.jpg";
          }}
        />
      </div>
      
      {/* Story Content */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">
          {getTranslatedTitle()}
        </h1>
        <p className="text-gray-600 mb-6">Age group: {story.ageGroup} years</p>
        
        {getTranslatedDescription() && (
          <div className="bg-purple-50 p-4 rounded-md mb-6 italic text-gray-700">
            {getTranslatedDescription()}
          </div>
        )}
        
        {getTranslatedContent() ? (
          <div className="prose max-w-none">
            {getTranslatedContent().split('\n').map((paragraph: string, idx: number) => {
              // Process text formatting
              let content = paragraph;
              
              // Format emphasis
              content = content.replace(/\*([^*]+)\*/g, 
                '<span class="font-semibold text-purple-700">$1</span>'
              );
              
              // Format sound effects
              content = content.replace(/\b([A-Z]{2,}!+)\b/g, 
                '<span class="font-bold text-lg text-red-600">$1</span>'
              );
              
              // Format dialogue
              content = content.replace(/"([^"]+)"/g, 
                '<span class="text-blue-600">"$1"</span>'
              );
              
              return (
                <p key={idx} className="mb-4 text-lg" 
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              );
            })}
          </div>
        ) : (
          <p>No content available for this story.</p>
        )}
        
        {/* Removed the "Read Full Story" button as requested */}
      </div>
    </div>
  );
}
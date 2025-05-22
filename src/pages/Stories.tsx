// File: C:\Users\PMYLS\Desktop\Mahendar Website\Mahendar Website\Clone-childrens-website\childrens-clone\src\pages\Stories.tsx
// Modify your Stories page component to include filtering capabilities

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoryCard } from '../components/StoryCard';

// Programming language filter options
const PROGRAMMING_LANGUAGES = [
  { value: 'all', label: 'All Stories' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'scratch', label: 'Scratch' },
];

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Sindhi', label: 'Sindhi' },
  { value: 'Hindi', label: 'Hindi' }
];

// Update your Story interface to match the admin data structure
interface Story {
  id: string;
  title: string;
  link: string;
  ageGroup: string;
  coverUrl: string; // Make sure this matches the admin's field
  description?: string;
  content?: string;
  category?: string[];
  illustrations?: string[];
  audioUrl?: string;
  language?: string;
  isCodeStory?: boolean;
  codeSnippet?: string;
  programmingLanguage?: string;
  disabled?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [activeAgeGroup, setActiveAgeGroup] = useState('all');
  const [showCodeOnly, setShowCodeOnly] = useState(false);
  const [selectedContentLanguage, setSelectedContentLanguage] = useState('English');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        
        // Get all stories
        const storiesRef = collection(db, "stories");
        const querySnapshot = await getDocs(storiesRef);
        
        const allStories: Story[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include regular stories (not code stories)
          if (!data.isCodeStory) {
            allStories.push({
              id: doc.id,
              ...data
            } as Story);
          }
        });
        
        setStories(allStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, []);

  // Replace your loadStories function with this:
  const loadStories = async () => {
    try {
      setLoading(true);
      console.log("Loading stories - starting fetch...");
      
      // Simpler query that doesn't require a composite index
      const storiesQuery = query(
        collection(db, "stories")
        // No filters at query level
      );
      
      const snapshot = await getDocs(storiesQuery);
      console.log(`Raw stories count: ${snapshot.size}`);
      
      // Filter in JavaScript instead of at query level
      const storiesData: Story[] = [];
      snapshot.forEach((doc) => {
        const storyData = { id: doc.id, ...doc.data() } as Story;
        // Only include non-disabled stories that are NOT code stories
        if (!storyData.disabled && !storyData.isCodeStory) {
          storiesData.push(storyData);
        }
      });
      
      console.log(`Non-disabled, non-code stories count: ${storiesData.length}`);
      
      // Sort manually by createdAt
      storiesData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return 0;
      });
      
      setStories(storiesData);
    } catch (error) {
      console.error("Error loading stories:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter stories based on selected criteria
  const filteredStories = stories.filter(story => {
    // Skip disabled stories
    if (story.disabled) {
      return false;
    }
    
    // Filter by programming language
    if (selectedLanguage !== 'all' && story.isCodeStory) {
      if (story.programmingLanguage?.toLowerCase() !== selectedLanguage) {
        return false;
      }
    }
    
    // Filter by code stories only
    if (showCodeOnly && !story.isCodeStory) {
      return false;
    }
    
    // Filter by age group
    if (activeAgeGroup !== 'all') {
      if (story.ageGroup !== activeAgeGroup) {
        return false;
      }
    }
    
    return true;
  });

  // Debug function to check Firestore data
  const checkFirestoreData = async () => {
    try {
      const storiesRef = collection(db, "stories");
      const snapshot = await getDocs(storiesRef);
      console.log("========= FIRESTORE DEBUG =========");
      console.log(`Total documents in stories collection: ${snapshot.size}`);
      
      if (snapshot.size > 0) {
        console.log("First document fields:");
        const firstDoc = snapshot.docs[0].data();
        console.log(firstDoc);
        
        // Check for critical fields
        const requiredFields = ["title", "ageGroup", "coverUrl"];
        let missingFields = requiredFields.filter(field => !firstDoc[field]);
        
        if (missingFields.length > 0) {
          console.error(`⚠️ Missing required fields: ${missingFields.join(", ")}`);
        } else {
          console.log("✅ All required fields present");
        }
      }
      console.log("==================================");
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  // Add this debug button to your UI
  const DebugPanel = () => (
    <div style={{
      margin: '20px 0',
      padding: '10px',
      border: '1px dashed #ff6b6b',
      borderRadius: '4px',
      backgroundColor: '#fff5f5'
    }}>
      <h3>Debugging Tools</h3>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          onClick={checkFirestoreData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Firestore Data
        </button>
        <button 
          onClick={loadStories}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4dabf7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Stories
        </button>
      </div>
    </div>
  );

  return (
    <div className="stories-container">
      <h1>Stories Library</h1>
      
      <div className="filter-controls" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '16px 0',
        padding: '16px',
        background: '#f9f9f9',
        borderRadius: '8px'
      }}>
        {/* Language selection dropdown */}
        <div className="mb-4 flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">Select Language:</label>
          <div className="relative inline-block">
            <select
              value={selectedContentLanguage}
              onChange={(e) => setSelectedContentLanguage(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Code stories toggle */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showCodeOnly} 
              onChange={() => setShowCodeOnly(!showCodeOnly)} 
              style={{ marginRight: '8px' }}
            />
            Show Code Tutorials Only
          </label>
        </div>
        
        {/* Programming language filter - only visible when code is selected */}
        {(showCodeOnly || selectedLanguage !== 'all') && (
          <div>
            <h3 style={{ marginBottom: '8px' }}>Programming Language:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PROGRAMMING_LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLanguage(lang.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: 'none',
                    background: selectedLanguage === lang.value ? '#8a2be2' : '#e2e8f0',
                    color: selectedLanguage === lang.value ? 'white' : 'black',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Age group filter */}
        <div>
          <h3 style={{ marginBottom: '8px' }}>Age Group:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['all', '0-3', '3-6', '6-9', '9-12'].map(ageGroup => (
              <button
                key={ageGroup}
                onClick={() => setActiveAgeGroup(ageGroup)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  background: activeAgeGroup === ageGroup ? '#8a2be2' : '#e2e8f0',
                  color: activeAgeGroup === ageGroup ? 'white' : 'black',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {ageGroup === 'all' ? 'All Ages' : ageGroup + ' years'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div style={{ margin: '16px 0' }}>
        <p>
          {loading ? 'Loading stories...' : 
            filteredStories.length === 0 ? 'No stories found' : 
            `Showing ${filteredStories.length} ${filteredStories.length === 1 ? 'story' : 'stories'}`
          }
        </p>
      </div>

      {/* Stories grid */}
      <div className="stories-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {filteredStories.map(story => (
          <StoryCard
            key={story.id}
            id={story.id}
            title={story.title}
            link={story.link}
            ageGroup={story.ageGroup}
            coverUrl={story.coverUrl} // Make sure this matches!
            isCodeStory={story.isCodeStory}
            codeSnippet={story.codeSnippet}
            programmingLanguage={story.programmingLanguage}
          />
        ))}
      </div>

      {/* Debug panel - only visible in development mode */}
      {process.env.NODE_ENV !== 'production' && <DebugPanel />}
    </div>
  );
}
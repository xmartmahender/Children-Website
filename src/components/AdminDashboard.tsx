// File: C:\Users\PMYLS\Desktop\Mahendar Website\Clone-childrens-website\childrens-clone\src\components\AdminDashboard.tsx
import { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function AdminDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ageGroup, setAgeGroup] = useState('0-3');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !ageGroup || !content) {
      setMessage('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('');
      
      let coverImageUrl = '';
      
      if (coverImage) {
        const storageRef = ref(storage, `story-covers/${Date.now()}-${coverImage.name}`);
        await uploadBytes(storageRef, coverImage);
        coverImageUrl = await getDownloadURL(storageRef);
      }
      
      const storyData = {
        title,
        description,
        ageGroup,
        content,
        coverImageUrl,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'stories'), storyData);
      
      setTitle('');
      setDescription('');
      setAgeGroup('0-3');
      setCoverImage(null);
      setContent('');
      setMessage('Story added successfully!');
    } catch (error) {
      console.error('Error adding story:', error);
      setMessage('Failed to add story. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard - Add Story</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 mb-2">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="ageGroup" className="block text-gray-700 mb-2">Age Group *</label>
          <select
            id="ageGroup"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="0-3">0-3 years</option>
            <option value="3-6">3-6 years</option>
            <option value="6-9">6-9 years</option>
            <option value="9-12">9-12 years</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="coverImage" className="block text-gray-700 mb-2">Cover Image</label>
          <input
            type="file"
            id="coverImage"
            onChange={(e) => e.target.files && setCoverImage(e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            accept="image/*"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 mb-2">Story Content *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={10}
            required
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Adding Story...' : 'Add Story'}
        </button>
      </form>
    </div>
  );
}
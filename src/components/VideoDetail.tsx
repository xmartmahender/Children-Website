// File: C:\Users\PMYLS\Desktop\Mahendar Website\Clone-childrens-website\childrens-clone\src\components\VideoDetail.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoDoc = await getDoc(doc(db, "videos", id));
        
        if (videoDoc.exists()) {
          setVideo({ id: videoDoc.id, ...videoDoc.data() });
        } else {
          setError("Video not found");
        }
      } catch (err) {
        console.error("Error loading video", err);
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading video...</div>;
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-red-500 mb-4">{error || "Video not found"}</div>
        <a href="/" className="text-blue-500 hover:underline">Return to home</a>
      </div>
    );
  }

  // Extract YouTube video ID if it's a YouTube URL
  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const embedUrl = getYoutubeEmbedUrl(video.videoUrl);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-96"
          ></iframe>
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
          <p className="text-gray-500 mb-4">Age group: {video.ageGroup} years</p>
          <div className="prose max-w-none">
            <p className="mb-4">{video.description}</p>
          </div>
          <div className="mt-6">
            <a href="/videos" className="text-blue-500 hover:underline">Back to videos</a>
          </div>
        </div>
      </div>
    </div>
  );
}
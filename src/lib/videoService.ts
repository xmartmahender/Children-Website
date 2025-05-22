// File: C:\Users\PMYLS\Desktop\Mahendar Website\Clone-childrens-website\childrens-clone\src\lib\videoService.ts
import { db } from "./firebase";
import { 
  collection, getDocs, getDoc, doc, query, 
  where, orderBy, limit, Timestamp 
} from "firebase/firestore";

export type Video = {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  ageGroup: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const getVideos = async (ageGroup?: string, limitCount = 10) => {
  try {
    let q;
    if (ageGroup) {
      q = query(
        collection(db, "videos"), 
        where("ageGroup", "==", ageGroup),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, "videos"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const videos: Video[] = [];
    
    querySnapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() } as Video);
    });
    
    return videos;
  } catch (error) {
    console.error("Error getting videos: ", error);
    throw error;
  }
};

export const getVideoById = async (id: string) => {
  try {
    const videoDoc = await getDoc(doc(db, "videos", id));
    
    if (videoDoc.exists()) {
      return { id: videoDoc.id, ...videoDoc.data() } as Video;
    } else {
      throw new Error("Video not found");
    }
  } catch (error) {
    console.error("Error getting video: ", error);
    throw error;
  }
};
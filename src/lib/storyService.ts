// File: C:\Users\PMYLS\Desktop\Mahendar Website\Clone-childrens-website\childrens-clone\src\lib\storyService.ts
import { db } from "./firebase";
import { 
  collection, getDocs, getDoc, doc, query, 
  where, orderBy, limit, Timestamp 
} from "firebase/firestore";

export type Story = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  ageGroup: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const getStories = async (ageGroup?: string, limitCount = 10) => {
  try {
    let q;
    if (ageGroup) {
      q = query(
        collection(db, "stories"), 
        where("ageGroup", "==", ageGroup),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, "stories"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const stories: Story[] = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() } as Story);
    });
    
    return stories;
  } catch (error) {
    console.error("Error getting stories: ", error);
    throw error;
  }
};

export const getStoryById = async (id: string) => {
  try {
    const storyDoc = await getDoc(doc(db, "stories", id));
    
    if (storyDoc.exists()) {
      return { id: storyDoc.id, ...storyDoc.data() } as Story;
    } else {
      throw new Error("Story not found");
    }
  } catch (error) {
    console.error("Error getting story: ", error);
    throw error;
  }
};
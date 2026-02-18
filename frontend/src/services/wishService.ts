import { Wish } from "@/types/wish";

import { API_BASE_URL } from "@/lib/api";
const API_URL = `${API_BASE_URL}/api/wishes`;

// Use explicit weddingId for clarity, backward compatible with existing calls if they passed weddingId as recipient
export const saveWish = async (name: string, wish: string, weddingId: string): Promise<void> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, wish, weddingId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
    }
    console.log("Wish saved successfully to backend!");
  } catch (error) {
    console.error("Error saving wish:", error);
    throw error;
  }
};

export const getWishes = async (weddingId?: string): Promise<Wish[]> => {
  try {
    const url = weddingId ? `${API_URL}?weddingId=${weddingId}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Wish[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return [];
  }
};

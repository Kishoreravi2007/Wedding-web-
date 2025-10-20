import { Wish } from "@/types/wish";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api/wishes`;

export const saveWish = async (name: string, wish: string, recipient: string): Promise<void> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, wish, recipient }),
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

export const getWishes = async (recipient?: string): Promise<Wish[]> => {
  try {
    const url = recipient ? `${API_URL}?recipient=${recipient}` : API_URL;
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

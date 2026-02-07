export interface Wish {
  id: string; // Unique ID for each wish
  name: string;
  wish: string; // Text wish message
  timestamp: string; // Store as ISO string for easier serialization
  recipient?: 'parvathy' | 'sreedevi' | 'both'; // Optional field to specify the recipient of the wish
  audioUrl?: string; // Optional field for voice messages
}

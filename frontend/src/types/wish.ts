export interface Wish {
  id: string; // Unique ID for each wish
  name: string;
  wish?: string; // Make wish optional as it can be a voice message
  audioUrl?: string; // Optional URL for the voice message
  timestamp: string; // Store as ISO string for easier serialization
  recipient?: 'parvathy' | 'sreedevi' | 'both'; // Optional field to specify the recipient of the wish
}

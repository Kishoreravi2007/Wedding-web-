import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWishes } from "@/services/wishService";
import { Wish } from "@/types/wish";
interface WishDisplayProps {
  recipient: 'parvathy' | 'sreedevi';
}

const WishDisplay: React.FC<WishDisplayProps> = ({ recipient }) => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const fetchedWishes = await getWishes();
        // Filter wishes based on the recipient prop
        const filteredWishes = fetchedWishes.filter(
          (wishItem) => wishItem.recipient === recipient || wishItem.recipient === 'both'
        );
        setWishes(filteredWishes);
      } catch (err) {
        setError("Failed to load wishes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishes();
  }, [recipient]); // Re-fetch wishes when recipient changes

  if (loading) {
    return <div className="text-center text-white mt-8">Loading wishes for {recipient}...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="w-full">
      {wishes.length === 0 ? (
        <p className="text-center text-slate-400 py-8 italic font-medium">No wishes received yet.</p>
      ) : (
        <div className="space-y-4">
          {wishes.map((wishItem) => (
            <Card key={wishItem.id} className="bg-white border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-2">
                <CardTitle className="text-sm font-bold text-slate-700">{wishItem.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {wishItem.wish && <p className="text-slate-600 leading-relaxed">{wishItem.wish}</p>}
                {wishItem.audioUrl && (
                  <audio controls src={wishItem.audioUrl} className="w-full mt-4 h-8"></audio>
                )}
                {!wishItem.wish && !wishItem.audioUrl && (
                  <p className="text-sm text-slate-400 italic">No message content.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishDisplay;

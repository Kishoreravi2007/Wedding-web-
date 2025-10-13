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

  const recipientName = recipient.charAt(0).toUpperCase() + recipient.slice(1);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-4xl font-heading text-center mb-8 text-[#800000] font-bold">
        Wishes for {recipientName}
      </h2>
      {wishes.length === 0 ? (
        <p className="text-center text-white">No wishes received for {recipientName} yet.</p>
      ) : (
        <div className="space-y-4">
          {wishes.map((wishItem) => (
            <Card key={wishItem.id} className="bg-[#FFFDD0]/50 border border-[#800000] text-[#800000]">
              <CardHeader>
                <CardTitle className="text-2xl font-display">{wishItem.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{wishItem.wish}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishDisplay;

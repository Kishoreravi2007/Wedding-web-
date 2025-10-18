import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed toast utilities - using simple alerts instead
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getWishes } from "@/services/wishService"; // Import getWishes

import { Wish } from "@/types/wish"; // Import Wish interface from types

// Removed local Wish interface as it's now imported

const Wishes = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Revert to false
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  const correctPassword = import.meta.env.VITE_WISHES_PASSWORD;

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishes();
    }
  }, [isAuthenticated]);

  const fetchWishes = async () => {
    setLoading(true);
    try {
      const fetchedWishes = await getWishes();
      setWishes(fetchedWishes);
    } catch (error) {
      console.error("Error fetching wishes:", error);
      alert(t('couldNotLoadWishesAlert'));
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting login with password:", password); // Add console log
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert(t('incorrectPasswordAlert'));
    }
  };

  if (!correctPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 p-4">
        <div className="text-center text-red-800">
          <h1 className="text-2xl font-bold">Configuration Error</h1>
          <p>The password for the wishes page is not set. Please contact the developer.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8E1] p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-center font-heading text-3xl text-[#5D4037]">
                View Wishes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="password-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full bg-[#5D4037] hover:bg-[#4E342E] text-white">
                Unlock
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  // Filter wishes based on recipient property
  const parvathyWishes = wishes.filter(w => w.recipient === 'parvathy' || w.recipient === 'both');
  const sreedeviWishes = wishes.filter(w => w.recipient === 'sreedevi' || w.recipient === 'both');

  return (
    <div className="min-h-screen bg-[#FFF8E1] p-4 md:p-8">
      <h1 className="font-heading text-5xl text-center my-8 text-[#5D4037]">Guest Wishes</h1>
      {loading ? (
        <p className="text-center">Loading wishes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <h2 className="font-heading text-4xl text-center mb-4 text-[#8C3B3B]">For Parvathy C</h2>
            <div className="space-y-4">
              {parvathyWishes.length > 0 ? parvathyWishes.map(wish => (
                <Card key={wish.id} className="bg-white/80">
                  <CardContent className="p-4">
                    <p className="text-stone-700">"{wish.wish}"</p>
                    <p className="text-right text-stone-500 mt-2">- {wish.name || 'Anonymous'}</p>
                  </CardContent>
                </Card>
              )) : <p className="text-center text-stone-500">No wishes yet.</p>}
            </div>
          </div>
          <div>
            <h2 className="font-heading text-4xl text-center mb-4 text-[#1B5E20]">For Sreedevi C</h2>
            <div className="space-y-4">
              {sreedeviWishes.length > 0 ? sreedeviWishes.map(wish => (
                <Card key={wish.id} className="bg-white/80">
                  <CardContent className="p-4">
                    <p className="text-stone-700">"{wish.wish}"</p>
                    <p className="text-right text-stone-500 mt-2">- {wish.name || 'Anonymous'}</p>
                  </CardContent>
                </Card>
              )) : <p className="text-center text-stone-500">No wishes yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishes;

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { saveWish } from "@/services/wishService";

interface WishBoxProps {
  recipient: string;
}

const WishBox: React.FC<WishBoxProps> = ({ recipient }) => {
  const [name, setName] = useState("Auto Test Name");
  const [wish, setWish] = useState("Auto Test Wish");

  const handleSubmit = async (n: string, w: string) => {
    if (n.trim() && w.trim()) {
      try {
        await saveWish(n, w, recipient);
        alert("Your wish has been sent successfully!");
        setName("");
        setWish("");
      } catch (error) {
        alert("Failed to send wish. Please try again.");
        console.error("Error details:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      }
    } else {
      alert("Please enter both your name and your wish.");
    }
  };

  useEffect(() => {
    handleSubmit(name, wish);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Send Your Wishes</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
          readOnly
        />
        <Textarea
          placeholder="Type your heartfelt wishes here..."
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          className="mb-4"
          readOnly
        />
        <p className="text-xs text-gray-500 mb-4">Only couples can see the wishes.</p>
        <Button onClick={() => handleSubmit(name, wish)} className="w-full">
          Send Wish (Auto-submitted)
        </Button>
      </CardContent>
    </Card>
  );
};

export default WishBox;

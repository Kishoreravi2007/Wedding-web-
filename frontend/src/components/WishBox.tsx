import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { useTranslation } from 'react-i18next';

import { saveWish } from "@/services/wishService";

// Extend the Window interface to include webkitSpeechRecognition for better browser compatibility
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}


interface WishBoxProps {
  recipient: string;
}

const WishBox: React.FC<WishBoxProps> = ({ recipient }) => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Speech-to-text setup
    const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      const recognizer: SpeechRecognition = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      
      // Map i18n language codes to SpeechRecognition locale codes
      const speechLangMap: { [key: string]: string } = {
        en: "en-US",
        ml: "ml-IN",
      };
      recognizer.lang = speechLangMap[i18n.language] || "en-US";

      recognizer.onstart = () => {
        setIsListening(true);
        console.log("Speech recognition started");
      };

      recognizer.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setWish((prevWish) => prevWish + (prevWish ? " " : "") + transcript);
        setIsListening(false);
        console.log("Speech recognition result:", transcript);
      };

      recognizer.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        alert(`Speech recognition error: ${event.error}`);
      };

      recognizer.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
      };

      setRecognition(recognizer);
    } else {
      console.warn("Web Speech API not supported in this browser.");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [i18n.language]);

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        setWish(""); // Clear previous wish before starting new recognition
        recognition.start();
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert(t('pleaseEnterName'));
      return;
    }

    if (!wish.trim()) {
      alert(t('pleaseEnterWish'));
      return;
    }

    try {
      await saveWish(name, wish.trim(), recipient);
      alert(t('wishSentSuccess'));
      setName("");
      setWish("");
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`${t('failedToSendWish')}: ${errorMessage}. ${t('pleaseTryAgain')}`);
      console.error("Error details:", error);
    }
  };

  return (
    <Card className="w-full sm:max-w-md mx-auto mt-4 sm:mt-8">
      <CardHeader>
        <CardTitle>{t('sendYourWishes')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder={t('yourName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />
        <div className="relative mb-4">
          <Textarea
            placeholder={t('typeYourWishes')}
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            className="pr-10"
          />
          {recognition && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleListening}
              className="absolute right-2 top-2"
              disabled={isListening}
            >
              <Mic className={isListening ? "text-red-500 animate-pulse" : "text-gray-500"} />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">{t('wishesSharedPrivately')}</p>
        <Button onClick={handleSubmit} className="w-full">
          {t('sendWish')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WishBox;

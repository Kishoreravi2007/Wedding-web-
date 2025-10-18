import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, StopCircle, Play, Trash2 } from "lucide-react"; // Import new icons
import { useTranslation } from 'react-i18next'; // Import useTranslation

import { saveWish } from "@/services/wishService";

// Helper function to find the best supported audio MIME type
const getSupportedMimeType = () => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4", // Less likely to be supported by MediaRecorder directly
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
};

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
  const { t, i18n } = useTranslation(); // Get the t function and i18n instance
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // State for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioError, setAudioError] = useState(false); // New state for audio errors
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null); // To store the object URL

  useEffect(() => {
    // Cleanup previous object URL if it exists
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [audioBlob]); // Revoke when audioBlob changes

  useEffect(() => {
    // Speech-to-text setup
    const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      const recognizer: SpeechRecognition = new SpeechRecognition(); // Explicitly type recognizer
      recognizer.continuous = false;
      recognizer.interimResults = false;
      
      // Map i18n language codes to SpeechRecognition locale codes
      const speechLangMap: { [key: string]: string } = {
        en: "en-US",
        ml: "ml-IN",
      };
      recognizer.lang = speechLangMap[i18n.language] || "en-US"; // Use current i18n language, fallback to en-US

      recognizer.onstart = () => {
        setIsListening(true);
        setAudioError(false); // Reset audio error on new recognition
        console.log("Speech recognition started");
      };

      recognizer.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setWish((prevWish) => prevWish + (prevWish ? " " : "") + transcript);
        setIsListening(false);
        setAudioError(false); // Reset audio error on successful recognition
        console.log("Speech recognition result:", transcript);
      };

      recognizer.onerror = (event: SpeechRecognitionErrorEvent) => { // Corrected type
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
      console.warn("Web Speech API (text) not supported in this browser.");
      // alert("Voice input (text) is not supported in your browser."); // Removed to avoid multiple alerts
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [i18n.language]); // Re-run effect when language changes

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        setWish(""); // Clear previous wish before starting new recognition
        setAudioBlob(null); // Clear any recorded audio
        setAudioError(false); // Reset audio error
        recognition.start();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = getSupportedMimeType();

      if (!supportedMimeType) {
        alert("No supported audio recording format found in this browser.");
        console.error("No supported audio recording format found.");
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioBlob(null); // Clear previous audio
      setAudioError(false); // Reset audio error on new recording

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          console.error("No audio data recorded.");
          setAudioBlob(null);
          setAudioError(true); // Indicate an error if no data was recorded
        } else {
          const newAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
          setAudioBlob(newAudioBlob);
          setAudioError(false); // Reset error if a new blob is created
          console.log(`Recording stopped, audio blob created with type ${mediaRecorderRef.current?.mimeType || "audio/webm"}.`);
        }
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };

      mediaRecorder.start();
      setIsRecording(true);
      setWish(""); // Clear text wish when starting audio recording
      console.log("Recording started");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure it's connected and permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      console.log("Stopping recording...");
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioError(false); // Reset audio error when clearing audio
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert(t('pleaseEnterName'));
      return;
    }

    if (!wish.trim() && !audioBlob) {
      alert(t('pleaseEnterWish'));
      return;
    }

    try {
      await saveWish(name, wish.trim() || undefined, recipient, audioBlob); // Pass audioBlob
      alert(t('wishSentSuccess'));
      setName("");
      setWish("");
      clearAudio(); // Clear audio after submission
    } catch (error: any) { // Explicitly type error as 'any' for easier access to message
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`${t('failedToSendWish')}: ${errorMessage}. ${t('pleaseTryAgain')}`);
      console.error("Error details:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
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
            disabled={isRecording || audioBlob !== null} // Disable if recording or audio exists
          />
          {recognition && !isRecording && audioBlob === null && ( // Show text-to-speech button only if no audio is being recorded or exists
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

        <div className="flex items-center justify-center space-x-2 mb-4">
          {!isRecording && !audioBlob && (
            <Button onClick={startRecording} disabled={isListening}>
              <Mic className="mr-2 h-4 w-4" /> {t('recordVoiceMessage')}
            </Button>
          )}
          {isRecording && (
            <Button onClick={stopRecording} variant="destructive">
              <StopCircle className="mr-2 h-4 w-4" /> {t('stopRecording')}
            </Button>
          )}
          {audioBlob && (
            <>
              <Button onClick={playAudio} variant="outline" disabled={audioError}>
                <Play className="mr-2 h-4 w-4" /> {t('play')}
              </Button>
              <Button onClick={clearAudio} variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {audioBlob && (
          <audio
            ref={audioRef}
            className="w-full mb-4"
            controls
            src={audioUrlRef.current || (audioUrlRef.current = URL.createObjectURL(audioBlob))} // Assign and use the object URL
            onError={() => {
              setAudioError(true);
              console.error("Audio playback error.");
            }}
          ></audio>
        )}
        {audioError && (
          <p className="text-red-500 text-sm text-center mb-4">
            {t('errorPlayingAudio')}
          </p>
        )}

        <p className="text-xs text-gray-500 mb-4">{t('wishesSharedPrivately')}</p>
        <Button onClick={handleSubmit} className="w-full" disabled={isRecording}>
          {t('sendWish')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WishBox;

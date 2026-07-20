import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SR = any;

export function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recogRef = useRef<SR | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      onResultRef.current(transcript);
    };
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== "aborted" && e.error !== "no-speech") {
        toast.error(`Voice input error: ${e.error}`);
      }
    };
    recognition.onend = () => setIsListening(false);
    recogRef.current = recognition;
    return () => {
      try { recognition.abort(); } catch {}
    };
  }, []);

  const start = useCallback(() => {
    if (!recogRef.current) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    try {
      recogRef.current.start();
      setIsListening(true);
    } catch {}
  }, []);

  const stop = useCallback(() => {
    try { recogRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    isListening ? stop() : start();
  }, [isListening, start, stop]);

  return { isListening, supported, start, stop, toggle };
}

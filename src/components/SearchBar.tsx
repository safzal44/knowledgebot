import { Search, Mic, MicOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface SearchBarProps {
  placeholder?: string;
  large?: boolean;
}

export function SearchBar({ placeholder = "Ask any HR question...", large = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isListening, supported, toggle } = useVoiceInput((text) => {
    setQuery((prev) => (prev ? prev + " " : "") + text);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/ask?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${large ? "h-5 w-5" : "h-4 w-4"}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`search-input pl-12 ${large ? "py-5 pr-44 text-lg" : "py-3 pr-36 text-base"}`}
        />
        {supported && (
          <button
            type="button"
            onClick={toggle}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            title={isListening ? "Stop voice input" : "Speak your question"}
            className={`absolute top-1/2 -translate-y-1/2 rounded-lg transition-colors flex items-center justify-center ${
              large ? "right-32 h-10 w-10" : "right-24 h-9 w-9"
            } ${isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {isListening ? <MicOff className={large ? "h-5 w-5" : "h-4 w-4"} /> : <Mic className={large ? "h-5 w-5" : "h-4 w-4"} />}
          </button>
        )}
        <button
          type="submit"
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90 ${
            large ? "px-6 py-2.5" : "px-4 py-2"
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}

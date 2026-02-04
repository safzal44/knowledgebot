import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  placeholder?: string;
  large?: boolean;
}

export function SearchBar({ placeholder = "Ask any HR question...", large = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

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
          className={`search-input pl-12 ${large ? "py-5 text-lg" : "py-3 text-base"}`}
        />
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

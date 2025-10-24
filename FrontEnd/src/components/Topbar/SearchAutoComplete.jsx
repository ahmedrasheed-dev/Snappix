import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import axiosInstance from "@/api/axios"; // Import axios

const SearchAutocomplete = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length > 2) {
        setLoading(true);
        try {
          const response = await axiosInstance.get(
            `${import.meta.env.VITE_BASE_URL}/users/suggestions?q=${searchTerm}`
          );
          setSuggestions(response.data.data);
          console.log("Search suggestions:", response.data.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching search suggestions:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full max-w-lg mx-auto md:mx-0">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search videos or channels..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() =>
            searchTerm.length > 2 && setShowSuggestions(true)
          }
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30"
        >
          {loading ? (
            <div className="p-3 text-gray-400 text-sm text-center animate-pulse">
              Loading suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item) => (
              <Link
                key={item._id}
                to={item.url}
                onClick={handleSuggestionClick}
                className="flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors duration-200 cursor-pointer border-b border-gray-700 last:border-b-0"
              >
                {item.type === "video" ? (
                  <img
                    src={
                      item.thumbnail ||
                      `https://placehold.co/60x35/4a5568/white?text=${item.title.substring(
                        0,
                        5
                      )}`
                    } // Use actual thumbnail or placeholder
                    alt={item.title}
                    className="w-16 h-9 object-cover rounded-md flex-shrink-0 overflow-hidden"
                  />
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center bg-pink-600 rounded-full text-white text-sm font-bold flex-shrink-0">
                    {item.avatar ? ( // Use actual avatar or fallback to initial
                      <img
                        src={item.avatar}
                        alt={item.title}
                        className="w-full h-full rounded-full object-cover overflow-hidden"
                      />
                    ) : (
                      item.title.charAt(0).toUpperCase()
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium line-clamp-1">
                    {item.title}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {item.type === "video" ? "Video" : "Channel"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            searchTerm.length > 2 && ( // Only show "No results" if search term is long enough
              <div className="p-3 text-gray-400 text-sm text-center">
                No results found for "{searchTerm}"
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;

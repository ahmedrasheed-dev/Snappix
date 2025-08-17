import React from "react";
import { SearchIcon } from "../../assets/"; // Assuming this is your SearchIcon component

const SearchBar = () => {
  return (
    <>
      <div className="flex items-center w-[550px] h-12 rounded-full overflow-hidden">
        {/* The input field container */}
        <div className="relative flex items-center flex-grow h-full bg-main-black px-4">
          {/* Search Icon inside the input area */}
          <SearchIcon className="text-gray-400 size-5 " />

          {/* The actual input element */}
          <input
            type="text"
            name="searchBar"
            id="searchBar"
            placeholder="cute cats"
            className="w-full h-full bg-transparent text-white pl-10 pr-4 outline-none placeholder-gray-400"
          />
        </div>

        {/* Search Button */}
        <button className="flex-shrink-0 w-16 h-full bg-pink-600 flex items-center justify-center">
          {/* The search button icon, as seen in the image */}
          <SearchIcon className="text-white size-6" />
        </button>
      </div>
      
    </>
  );
};

export default SearchBar;

import React from 'react';
import { Link } from 'react-router-dom'; // Assumes Link context is provided by your App Router
import { Ghost, Home, ArrowLeft } from 'lucide-react';

const Error = () => {
  return (
    // Outer container: Dark background, full screen, centered
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 text-gray-200">
      
      {/* Ghost Icon with a simple Tailwind animation */}
      <div className="mb-8 text-pink-500 animate-pulse">
        <Ghost size={80} strokeWidth={1.5} />
      </div>

      {/* Main Error Code and Title */}
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4 tracking-tight">
        404
      </h1>
      
      <h2 className="text-4xl font-bold mb-6 text-gray-100 text-center">
        Page Not Found
      </h2>

      {/* Descriptive Message */}
      <p className="text-lg text-gray-400 mb-10 max-w-md text-center">
        Oops! It looks like the digital universe took a wrong turn. The page you are looking for has vanished into the aether.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* Go Home Button */}
        <Link 
          to="/" 
          className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-pink-600 hover:bg-pink-700 transition duration-300 transform hover:scale-[1.02]"
        >
          <Home className="w-5 h-5 mr-2" />
          Go to Homepage
        </Link>
        
        {/* Go Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center justify-center px-6 py-3 border border-pink-500 text-base font-medium rounded-lg shadow-lg text-pink-500 bg-zinc-800 hover:bg-zinc-700 transition duration-300 transform hover:scale-[1.02]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Error;

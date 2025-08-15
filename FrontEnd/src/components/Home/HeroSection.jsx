import React from "react";
import HeroImage from "../../assets/HeroImage.jpg";
import Topbar from "../Topbar/Topbar";
const HeroSection = () => {
  return (
    <>
      <div
        className="relative w-full min-h-96 bg-cover bg-center p-11 overflow-hidden"
        style={{ backgroundImage: `url(${HeroImage})` }}
      >
        {/* <Topbar classes={""}/> */}

        {/* Gradient Overlay for the BOTTOM fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-main-black to-transparent"></div>

        {/* Text content, placed on top of all overlays */}
        <div className="relative z-10 flex flex-col justify-center h-full text-white py-4 scroll-m-0">
          <div className="relative z-10 flex flex-col items-left justify-center h-full text-white">
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold md:text-6xl">
                Your gateway to unlimited entertainment
              </h1>
              <p className="mt-4 text-lg md:text-xl max-w-2xl">
                With our seamless streaming technology, you can effortlessly
                discover and enjoy content that resonates with your interests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;

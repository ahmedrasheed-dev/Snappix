import React, { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddVideoicon } from "../../assets/index.js";
import SearchAutocomplete from "./SearchAutoComplete";
import { Menu } from "lucide-react";
import { notifyError } from "@/utils/toasts.js";

const Topbar = ({ classes, onMenuClick }) => {
  const navigate = useNavigate();

  const { user, isLoggedIn, status } = useSelector((state) => state.user);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAddVideoDropdownOpen, setIsAddVideoDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const addVideoDropdownRef = useRef(null);
  const userAvatarRef = useRef(null);
  const addVideoIconRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        userAvatarRef.current &&
        !userAvatarRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }

      if (
        addVideoDropdownRef.current &&
        !addVideoDropdownRef.current.contains(event.target) &&
        addVideoIconRef.current &&
        !addVideoIconRef.current.contains(event.target)
      ) {
        setIsAddVideoDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex items-center justify-between px-4 ${classes}`}>
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 flex justify-center">
        <SearchAutocomplete />
      </div>

      <div className="flex items-center gap-4">
        {!isLoggedIn && (
          <div className="flex rounded-sm p-2 gap-2 w-48 transition-all">
            <NavLink to="/login">
              <Button className="cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md px-4 py-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2  focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                LogIn
              </Button>
            </NavLink>
            <NavLink to="/register">
              <Button className="cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md px-4 py-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                Signup
              </Button>
            </NavLink>
          </div>
        )}

        {isLoggedIn && user && status === "succeeded" && (
          <>
            {/* Add Video Dropdown */}
            <div className="relative">
              <div
                className="cursor-pointer"
                onClick={() => setIsAddVideoDropdownOpen(!isAddVideoDropdownOpen)}
                ref={addVideoIconRef}
                title="Add a Video"
              >
                <AddVideoicon className="fill-pink-500" />
              </div>
              {isAddVideoDropdownOpen && (
                <div
                  ref={addVideoDropdownRef}
                  className="absolute flex flex-col bg-gray-100 text-gray-900 rounded-sm p-2 gap-2 cursor-pointer w-40 right-0 shadow-lg transition-all z-20"
                >
                  <NavLink
                    to={user?.isEmailVerified ? "/upload-video" : "/verify-email"}
                    onClick={(e) => {
                      if (!user?.isEmailVerified) {
                        notifyError("Please verify your Email to upload videos!");
                      }
                    }}
                  >
                    <p className="hover:text-pink-600 transition-colors duration-200">
                      Upload a Video
                    </p>
                  </NavLink>
                  <Separator />
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <Avatar
                ref={userAvatarRef}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="cursor-pointer"
              >
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              {isUserDropdownOpen && (
                <div
                  ref={userDropdownRef}
                  className="absolute flex flex-col gap-2 bg-gray-100 text-gray-900 rounded-sm p-4 cursor-pointer w-58 right-0 shadow-lg transition-all z-20"
                >
                  {!user.isEmailVerified && (
                    <>
                      <NavLink to="/verify-email">
                        <p className="hover:text-pink-600 transition-colors duration-200">
                          Verify Email
                        </p>
                      </NavLink>
                      <Separator />
                    </>
                  )}
                  <NavLink to="/dashboard">
                    <p className="hover:text-pink-600 transition-colors duration-200">Dashboard</p>
                  </NavLink>
                  <Separator />
                  <NavLink to="/logout">
                    <p className="hover:text-pink-600 transition-colors duration-200">Logout</p>
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Topbar;

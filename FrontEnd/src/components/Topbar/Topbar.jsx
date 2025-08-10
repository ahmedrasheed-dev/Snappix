import React from "react";
import SearchBar from "./SearchBar";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { AddVideoicon } from "../../assets/index.js";
const Topbar = () => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const user = useSelector((state) => state.user.user);

  return (
    <div className="flex align-center justify-between pb-22">
      <div className="flex align-center">
        <SearchBar />
      </div>

      {!isLoggedIn && (
        <div className="flex rounded-sm p-2 gap-2 w-48 transition-all">
          <NavLink to="/login">
            <Button
              className={
                "cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md px-4 py-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2  focus:ring-pink-500 focus:ring-offset-2  focus:ring-offset-gray-900"
              }
            >
              LogIn
            </Button>
          </NavLink>
          <NavLink to="/register">
            <Button
              className={
                "cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md px-4 py-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2  focus:ring-pink-500 focus:ring-offset-2  focus:ring-offset-gray-900"
              }
            >
              Signup
            </Button>
          </NavLink>
        </div>
      )}

      <div
        className="flex justify-center items-center gap-4"
        title="Add a Video"
      >
        {isLoggedIn && user && (
          <div className="group relative">
            <AddVideoicon className={"cursor-pointer fill-pink"} />
            <div
              className={`absolute  hidden group-hover:flex flex-col bg-gray-100 rounded-sm p-2 gap-2 cursor-pointer
                   w-40 right-0 shadow-lg transition-all`}
            >
              <>
                <NavLink to={"/upload"}>
                  <p className="hover:text-pink-600 transition-colors duration-200">
                    Upload a Video
                  </p>
                </NavLink>
                <Separator />
              </>
            </div>
          </div>
        )}

        {isLoggedIn && user && (
          <div className="relative group">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.username.split("")[0]}
              </AvatarFallback>
            </Avatar>

            <div
              className={`absolute hidden group-hover:flex flex-col bg-gray-100 rounded-sm p-2 gap-2 cursor-pointer
                   w-58 right-0 shadow-lg transition-all`}
            >
              {!user.isEmailVerified && (
                <>
                  <NavLink to={"/verify-email"}>
                    <p className="hover:text-pink-600 transition-colors duration-200">
                      Verify Email
                    </p>
                  </NavLink>
                  <Separator />
                </>
              )}

              <NavLink to={"/logout"}>
                <p className="hover:text-pink-600 transition-colors duration-200">
                  Logout
                </p>
              </NavLink>

              <Separator />
              <NavLink to={"/change-password"}>
                <p className="hover:text-pink-600 transition-colors duration-700">
                  Change Password
                </p>
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;

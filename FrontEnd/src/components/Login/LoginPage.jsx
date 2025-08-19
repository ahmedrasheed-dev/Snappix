import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { perfomLogin } from "../../store/features/userSlice";
import { Loadericon } from "../../assets/index.js";
import { notifyError, notifySuccess } from "@/utils/toasts";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState(""); // Renamed for clarity

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const loginData = {
      email: data.email,
      password: data.password,
    };
    setErrorMessage("");

    try {
      const data = await dispatch(perfomLogin(loginData)).unwrap();
      notifySuccess("Login successful!");
      navigate("/");
    } catch (error) {
      console.log("login error: ", error)
      notifyError(error);
      setErrorMessage(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-black bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-white">LogIn</h2>
        <h3 className="text-center text-red-500 h-3.5 mt-4">{errorMessage}</h3>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white block text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                className="mt-1 block w-full rounded-md shadow-sm bg-gray-800 border-gray-700 text-white focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.email && <p className="text-pink-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-white block text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="mt-1 block w-full rounded-md shadow-sm bg-gray-800 border-gray-700 text-white focus:border-pink-500 focus:ring-pink-500"
              />
              {errors.password && (
                <p className="text-pink-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
            >
              {isSubmitting ? (
                <>
                  {<Loadericon className="animate-spin" />}
                  <span>Submitting...</span>
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-300">
          Dont't have an account?{" "}
          <Link to="/register" className="font-medium text-pink-500 hover:text-pink-400 underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

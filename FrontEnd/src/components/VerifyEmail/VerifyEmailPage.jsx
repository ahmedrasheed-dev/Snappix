import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loadericon } from "../../assets/index.js";
import OtpInputComponent from "./OtpInputComponent";
import axiosInstance from "@/api/axios";

const VerifyEmailPage = () => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [Error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(
        `/auth/send-verification-code`,
        {
          email: data.email,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log("OTP sent:  ", response?.data?.message);
      setShowOtpInput(true);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
        console.error("Backend Error:", error.response.data.message);
      } else {
        console.error("An unexpected error occurred:", error.message);
      }
    }
  };

  if (showOtpInput) {
    return (
      <div className="flex justify-center items-center h-screen">
        <OtpInputComponent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col p-8 bg-gray-800 rounded-lg shadow-lg max-w-sm w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Verify Email
        </h1>
        <p className="text-center mb-6 text-gray-400">
          Enter your email to receive a verification code.
        </p>
        {Error && (
          <p className="text-pink-500 text-xs mt-1">{Error}</p>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 mt-4"
        >
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email address",
                },
              })}
              className="w-full rounded-md shadow-sm bg-gray-700 border-gray-600 text-white focus:border-pink-500 focus:ring-pink-500"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-pink-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          >
            {isSubmitting ? (
              <>
                <Loadericon className="animate-spin mr-2" />
                <span>Sending...</span>
              </>
            ) : (
              "Next"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

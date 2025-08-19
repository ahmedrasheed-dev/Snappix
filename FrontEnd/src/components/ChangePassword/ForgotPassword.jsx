import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loadericon } from "@/assets";
import OtpInputComponent from "../VerifyEmail/OtpInputComponent";
import axiosInstance from "@/api/axios";
import { notifySuccess, notifyError } from "@/utils/toasts";

const ForgotPassword = ({ onCancel }) => {
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");

  const [otpNewPassword, setOtpNewPassword] = useState("");
  const [otpConfirmNewPassword, setOtpConfirmNewPassword] = useState("");

  // --- Step 1: Send OTP ---
  const handleSendOtp = async () => {
    setOtpSending(true);
    try {
      await axiosInstance.post("/users/password-reset/send-otp");
      notifySuccess("OTP sent to your email");
      setOtpSent(true);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async () => {
    const otp = Array.from(document.querySelectorAll("input[type=text]"))
      .map((el) => el.value)
      .join("");

    if (!otp) {
      notifyError("Please enter the OTP");
      return;
    }

    setOtpVerifying(true);
    try {
      await axiosInstance.post("/users/password-reset/verify-otp", { otp });
      notifySuccess("OTP verified. Now set your new password.");
      setOtpVerified(true);
    } catch (err) {
      notifyError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  // --- Step 3: Reset Password ---
  const handleResetPassword = async () => {
    if (!otpNewPassword || !otpConfirmNewPassword) {
      notifyError("Enter and confirm new password");
      return;
    }
    if (otpNewPassword !== otpConfirmNewPassword) {
      notifyError("Passwords do not match");
      return;
    }

    try {
      await axiosInstance.post("/users/password-reset/set-password", {
        newPassword: otpNewPassword,
      });
      notifySuccess("Password reset successfully");
      onCancel(); // go back
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Send OTP */}
      {!otpSent && (
        <Button
          onClick={handleSendOtp}
          disabled={otpSending}
          className="w-full bg-pink-600 hover:bg-pink-700"
        >
          {otpSending ? (
            <>
              <Loadericon className="animate-spin mr-2" />
              Sending OTP...
            </>
          ) : (
            "Send OTP to Email"
          )}
        </Button>
      )}

      {/* Step 2: Enter + Verify OTP */}
      {otpSent && !otpVerified && (
        <>
          <OtpInputComponent
            handleSubmit={handleVerifyOtp}
            isSubmitting={otpVerifying}
            label="email"
            classes="bg-zinc-800 shadow-none"
            isEmail={false}
          />

          <Button
            type="submit"
            disabled={otpVerifying}
            onClick={() => handleVerifyOtp()}
            className="w-full py-3 px-4 rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          >
            {otpVerifying ? (
              <>
                {<Loadericon className="animate-spin" />}
                <span>Submitting...</span>
              </>
            ) : (
              "Submit"
            )}
          </Button>
          <Button
            onClick={handleVerifyOtp}
            disabled={otpVerifying}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            {otpVerifying ? (
              <>
                <Loadericon className="animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </>
      )}

      {/* Step 3: After OTP verified → New Password Inputs */}
      {otpVerified && (
        <>
          <div>
            <Label className="text-gray-300">New Password</Label>
            <Input
              type="password"
              value={otpNewPassword}
              onChange={(e) => setOtpNewPassword(e.target.value)}
              className="bg-zinc-700 border-zinc-600 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300">Confirm New Password</Label>
            <Input
              type="password"
              value={otpConfirmNewPassword}
              onChange={(e) => setOtpConfirmNewPassword(e.target.value)}
              className="bg-zinc-700 border-zinc-600 text-white"
            />
          </div>

          <Button onClick={handleResetPassword} className="w-full bg-pink-600 hover:bg-pink-700">
            Reset Password
          </Button>
        </>
      )}

      {/* Cancel Button */}
      <Button
        type="button"
        onClick={onCancel}
        variant="ghost"
        className="w-full bg-zinc-700 hover:bg-zinc-600 text-gray-200 border border-zinc-600"
      >
        Cancel
      </Button>
    </div>
  );
};

export default ForgotPassword;

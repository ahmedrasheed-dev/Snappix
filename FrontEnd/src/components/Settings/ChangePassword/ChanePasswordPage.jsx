import { useState } from "react";
import ChangeWithCurrentPass from "./ChangeWithCurrentPass";
import ForgotPassword from "./ForgotPassword";

const ChangePasswordPage = () => {
  const [showOtp, setShowOtp] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-900 text-white w-full">
      <div className="p-8 bg-zinc-800 rounded-lg shadow-lg ">
        <h1 className="text-2xl font-bold mb-6 text-center">Change Password</h1>

        {!showOtp ? (
          <ChangeWithCurrentPass onForgotPassword={() => setShowOtp(true)} />
        ) : (
          <ForgotPassword onCancel={() => setShowOtp(false)} />
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;

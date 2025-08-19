import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Loadericon } from "@/assets";

const OtpInputComponent = ({ handleSubmit, label, isSubmitting, classes, isEmail=true }) => {
  const navigate = useNavigate();
  const otpSize = 6;
  const [otp, setOtp] = useState(new Array(otpSize).fill(""));
  const inputRef = useRef([]);
  const [Error, setError] = useState("");

  const onHandleChange = (e, index) => {
    const value = e.target.value;
    setError("");
    if (!/^[0-9]$/.test(value)) {
      e.target.value = "";
      setError("Please enter a valid OTP");
      return;
    }
    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });
    if (index < otpSize - 1) {
      inputRef.current[index + 1].focus();
    }
  };

  const onHandleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };


  return (
    <div className={`flex flex-col justify-between items-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-sm w-3xl text-center text-white h-3/7 gap-3.5 ${classes}`}>
      <h2 className="text-3xl font-semibold mb-2">
        Enter OTP
        <p className="text-xl font-normal text-gray-400">An OTP has been sent to your {label}.</p>
      </h2>

      <div>{Error && <p className="text-red-500">{Error}</p>}</div>
      <div className="flex align-center">
        {Array.from({ length: otpSize }).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            ref={(input) => (inputRef.current[index] = input)}
            onChange={(e) => {
              onHandleChange(e, index);
            }}
            onKeyDown={(e) => {
              onHandleKeyDown(e, index);
            }}
            className="w-12 h-12 m-2 text-center text-white rounded-md outline-none border border-gray-600 focus:border-pink-600"
          />
        ))}
      </div>

      {isEmail &&<Button
        type="submit"
        disabled={isSubmitting}
        onClick={() => handleSubmit()}
        className="w-full py-3 px-4 rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
      >
        {isSubmitting ? (
          <>
            {<Loadericon className="animate-spin" />}
            <span>Submitting...</span>
          </>
        ) : (
          "Submit"
        )}
      </Button>}
    </div>
  );
};
export default OtpInputComponent;

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axios";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Loadericon } from "@/assets";

const OtpInputComponent = () => {
  const navigate = useNavigate();
  const otpSize = 6;
  const [otp, setOtp] = useState(new Array(otpSize).fill(""));
  const [isSubmiting, setisSubmiting] = useState(false);
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

  const handleSubmit = async () => {
    setisSubmiting(true);
    const otpValue = otp.join("");
    const res = await axiosInstance.post(
      "/auth/verify-email",
      { otp: otpValue },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const notify = () => {
      toast.success("Email Verified Sucessfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    };

    if (res.status === 200) {
      setError("");
      setisSubmiting(false);
      navigate("/");

      notify();
    } else {
      console.log("OTP ERROR: ", res.data?.data?.message);
      setError(res.data.message);
      setisSubmiting(false);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-sm w-3xl text-center text-white h-3/7 gap-3.5">
      <h2 className="text-3xl font-semibold mb-2">
        Enter OTP
        <p className="text-xl font-normal text-gray-400">
          An OTP has been sent to your email.
        </p>
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

      <Button
        type="submit"
        disabled={isSubmiting}
        onClick={() => handleSubmit()}
        className="w-full py-3 px-4 rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
      >
        {isSubmiting ? (
          <>
            {<Loadericon className="animate-spin" />}
            <span>Submitting...</span>
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
};
export default OtpInputComponent;

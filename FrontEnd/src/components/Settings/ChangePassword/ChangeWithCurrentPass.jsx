import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loadericon } from "@/assets";
import axiosInstance from "@/api/axios";
import { notifySuccess, notifyError } from "@/utils/toasts";

const ChangeWithCurrentPass = ({ onForgotPassword }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPw = watch("newPassword");

  const handleChangeWithCurrent = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      notifyError("New passwords do not match");
      return;
    }
    try {
      const res = await axiosInstance.post(`${import.meta.env.VITE_BASE_URL}/users/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      notifySuccess(res.data.message || "Password changed successfully");
      reset();
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleChangeWithCurrent)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Current Password</Label>
        <Input
          type="password"
          {...register("currentPassword", { required: "Required" })}
          className="bg-zinc-700 border-zinc-600 text-white focus:ring-pink-500"
        />
        {errors.currentPassword && (
          <p className="text-pink-400 text-xs mt-1">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <Label className="text-gray-300">New Password</Label>
        <Input
          type="password"
          autocomplete="off"
          {...register("newPassword", {
            required: "Required",
            minLength: { value: 8, message: "At least 8 characters" },
          })}
          className="bg-zinc-700 border-zinc-600 text-white focus:ring-pink-500"
        />
        {errors.newPassword && (
          <p className="text-pink-400 text-xs mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <Label className="text-gray-300">Confirm New Password</Label>
        <Input
          type="password"
          autocomplete="off"
          {...register("confirmNewPassword", {
            required: "Required",
            validate: (v) => v === newPw || "Passwords do not match",
          })}
          className="bg-zinc-700 border-zinc-600 text-white focus:ring-pink-500"
        />
        {errors.confirmNewPassword && (
          <p className="text-pink-400 text-xs mt-1">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-600 hover:bg-pink-700"
      >
        {isSubmitting ? (
          <>
            <Loadericon className="animate-spin mr-2" />
            Changing...
          </>
        ) : (
          "Change Password"
        )}
      </Button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-pink-400 hover:text-pink-300 text-sm underline"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
};

export default ChangeWithCurrentPass;

"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  LucideLogOut,
  Loader2,
  User,
  Camera,
  MapPin,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Header from "@/components/Header";
import { logout } from "@/lib/auth/logout";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/profile";
import { ChangePasswordParams } from "@/lib/auth/password";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/user";
import { useQueryClient } from "@tanstack/react-query";

type ProfileFormValues = {
  first_name: string;
  last_name: string;
  address: string;
  contact: string;
  image?: File | null;
};

export default function UserProfile() {
  const { data: profile, isFetched, isLoading } = useProfile();
  const { setUser } = useUserStore();
  const queryClient = useQueryClient();
  const [loggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      address: profile?.address,
      contact: profile?.contact,
    },
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setUser({ email: "", last_name: "", first_name: "" });
      queryClient.removeQueries({ queryKey: ["profile"] });
      router.push("/");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const onSuccess = () =>
    toast({
      title: "Success",
      description: "Your changes have been saved successfully.",
      variant: "success",
    });
  const onError = () =>
    toast({
      title: "❌ Profile update failed !",
      description: "Something went wrong trying to update your profile.",
    });
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile(
    onError,
    onSuccess
  );

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm<ChangePasswordParams>();

  const onPasswordSuccess = () => {
    toast({
      title: "Success",
      description: "Your password has been changed successfully.",
      variant: "success",
    });
    resetPassword();
  };

  const onPasswordError = (error: any) => {
    toast({
      title: "❌ Password change failed",
      description: error.message || "Something went wrong.",
      variant: "destructive",
    });
  };

  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword(onPasswordError, onPasswordSuccess);

  const onPasswordSubmit = (data: ChangePasswordParams) => {
    changePassword(data);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const profileForm = new FormData();
      profileForm.append("first_name", data.first_name);
      profileForm.append("last_name", data.last_name);
      profileForm.append("contact", data.contact);
      profileForm.append("address", data.address);
      if (data.image) {
        profileForm.append("image", data.image);
      }
      updateProfile({ profile: profileForm, id: profile?.id });
    } catch (err) {
      console.error("Save profile error", err);
    }
  };

  useEffect(() => {
    if (!profile?.id && isFetched) router.push("/signin");
    reset({
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      address: profile?.address,
      contact: profile?.contact,
    });
  }, [profile, reset, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Header color="black" />
      <div className="overflow-hidden px-6 sm:px-10 lg:px-50 py-10">
        {isLoading ? (
          // Skeleton Loading State
          <div className="relative px-6 pb-6 animate-pulse">
            <div className="w-28 h-28 bg-gray-200 rounded-full mb-6" />
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="space-y-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="h-12 bg-gray-200 rounded" />
                    <div className="h-12 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative w-28 h-28 mb-6">
              <Avatar className="w-28 h-28">
                <AvatarImage
                  src={preview || profile?.image_url}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="text-xl font-semibold bg-gray-100 uppercase">
                  {profile?.first_name ? (
                    `${profile.first_name[0]}${profile.last_name?.[0] ?? ""}`
                  ) : (
                    <User />
                  )}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-primary-foreground shadow-md hover:bg-primary-hover cursor-pointer"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: profile form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-2xl font-bold text-black mb-2">
                  {[profile?.first_name, profile?.last_name]
                    .filter(Boolean)
                    .join(" ") || " "}
                </h1>
                <p className="text-gray-600 mb-6">{profile?.address}</p>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <Label className="text-sm font-medium text-black mb-3 block">
                      Name
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        id="firstName"
                        placeholder="First name"
                        className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black py-6"
                        {...register("first_name")}
                      />
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black py-6"
                        {...register("last_name")}
                      />
                    </div>
                  </div>

                  {/* Address + Contact */}
                  <div>
                    <Label
                      className="text-sm font-medium text-black mb-3 block"
                      htmlFor="address"
                    >
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="address"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-black focus:ring-black py-6"
                        {...register("address")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-black mb-3 block">
                      Contact Phone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="phone no."
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-black focus:ring-black py-6"
                        {...register("contact")}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    type="button"
                    className="flex items-center gap-2 w-full sm:w-auto py-6 min-w-[100px] cursor-pointer"
                    onClick={handleLogout}
                  >
                    {loggingOut ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <LucideLogOut size={16} />
                        <span>Log out</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-primary text-primary-foreground hover:bg-primary-hover w-full sm:w-auto py-6 cursor-pointer min-w-[125px]"
                  >
                    {isUpdating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </form>

              {/* Right: change password */}
              <div className="lg:border-l lg:border-gray-200 lg:pl-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Lock className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">Change Password</h2>
                    <p className="text-sm text-gray-500">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-sm font-medium text-black mb-2 block">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary py-6 pr-12"
                        {...registerPassword("new_password", {
                          required: "New password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordErrors.new_password && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.new_password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-black mb-2 block">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary py-6 pr-12"
                        {...registerPassword("confirm_password", {
                          required: "Please confirm your password",
                          validate: (value?: string) =>
                            value === watchPassword("new_password") ||
                            "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordErrors.confirm_password && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordErrors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-primary text-primary-foreground hover:bg-primary-hover w-full sm:w-auto py-6 px-8 cursor-pointer"
                    >
                      {isChangingPassword ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : null}
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

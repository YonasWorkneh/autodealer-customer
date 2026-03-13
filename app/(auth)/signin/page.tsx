"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Eye, EyeOff, Loader2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { signin } from "@/lib/auth/signin";
import { useUserStore } from "@/store/user";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, formState } = useForm();
  const { errors } = formState;
  const [err, setErr] = useState("");
  const { setUser } = useUserStore();
  const router = useRouter();
  const { toast } = useToast();
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setErr("");
      const user = await signin(data);
      console.log(user);
      if (!user.access) throw new Error("Error trying to log you in");
      setUser(user.user);
      router.push("/");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "❌ Login Failed",
        description: "Failed to login. Please try again.",
      });
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[380px] md:w-[450px]">
      <CardHeader>
        <Link
          href={"/"}
          className="flex items-center justify-center gap-2 mb-3 border-b pb-4"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <Image
              src="/wheel.png"
              alt="wheel"
              width={100}
              height={100}
              className="w-full h-full"
            />
          </div>
          <h1>hulucars</h1>
        </Link>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email", { required: "Email is required" })}
              onChange={() => setErr("")}
            />
            {errors?.email && (
              <p className="text-red-400 text-sm">
                {errors?.email?.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="password"
                autoComplete="password"
                {...register("password", { required: "Password is required" })}
                onChange={() => setErr("")}
              />
              <span
                className="absolute right-5 top-[8px]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            {errors?.password && (
              <p className="text-red-400 text-sm">
                {errors?.password?.message as string}
              </p>
            )}
          </div>
          {/* err */}
          {err && (
            <div className="flex gap-2">
              <p className="text-red-400 text-sm">{err}</p>
              <TriangleAlert className="text-red-400" size={18} />
            </div>
          )}

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <p> Login </p>
            )}
          </Button>

          <div
            className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col",
            )}
          >
            <Button
              variant="outline"
              className={cn("w-full gap-2 cursor-pointer")}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full py-4">
          <p className="text-center text-xs text-neutral-500">
            Don't have an account ?
            <Link href="/signup" className="underline">
              <span className="dark:text-white/70 cursor-pointer"> Signup</span>
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

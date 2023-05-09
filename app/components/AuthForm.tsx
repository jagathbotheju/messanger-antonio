"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FieldValue,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import Input from "./inputs/Input";
import Button from "./Button";
import AuthSocialButton from "./AuthSocialButton";
import { BsGithub, BsGoogle } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session?.status === "authenticated") {
      console.log(session);
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setLoading(true);
    if (variant === "REGISTER") {
      //axios register
      axios
        .post("/api/register", data)
        .then(() => {
          toast.success("User Registered Successfully");
          signIn("credentials", data);
        })
        .catch((error) => {
          console.log(error?.response?.data);
          toast.error(`${error?.response?.data}` || "Something went wrong!");
        })
        .finally(() => setLoading(false));
    }

    if (variant === "LOGIN") {
      //NextAuth login
      signIn("credentials", {
        ...data,
        redirect: false,
        callbackUrl: "/",
      })
        .then((callback) => {
          if (callback?.ok && !callback?.error) {
            toast.success(`You are Logged In`);
            router.push("/users");
          }
          if (callback?.error) {
            toast.error(callback.error);
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error("Internal Server Error");
        })
        .finally(() => setLoading(false));
    }
  };

  const socialAction = (action: string) => {
    setLoading(true);
    //NextAuth social login
    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.ok && !callback?.error) {
          toast.success("You are Logged In");
        }
        if (callback?.error) {
          toast.error(callback.error);
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Internal Server Error");
      })
      .finally(() => setLoading(false));
  };
  console.log(`loading ${loading}`);

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm-rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              label="Name"
              register={register}
              id="name"
              errors={errors}
              type="text"
              disabled={loading}
            />
          )}
          <Input
            label="Email"
            register={register}
            id="email"
            errors={errors}
            type="email"
            disabled={loading}
          />
          <Input
            label="Password"
            register={register}
            id="password"
            errors={errors}
            type="password"
            disabled={loading}
          />
          <div>
            <Button disabled={loading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign In" : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an Account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an Account" : "LogIn"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

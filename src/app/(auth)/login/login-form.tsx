/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/services/auth";
import toast from "react-hot-toast";
import { AtSign, Lock } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { useSocket } from "@/providers/socket-provider";
import { loginSchema } from "@/lib/validation";

const LoginForm = () => {
  const navigate = useRouter();
  const socket = useSocket();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values).then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data.user));
        socket?.connect();

        navigate.push("/");
        toast.success("Login successfully");
      });
    } catch (error: any) {
      toast.error(`Login failed: ${error.message}`);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7.5">
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    icon={AtSign}
                    placeholder="Your Email"
                    className="pl-10"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    icon={Lock}
                    placeholder="Your Password"
                    className="pl-10"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="flex items-center justify-end">
                  <Button size="sm" variant="link" asChild className="p-0">
                    <Link href="/reset">Forgot password?</Link>
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Loading..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;

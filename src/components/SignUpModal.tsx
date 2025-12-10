'use client';

import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";

const SignUpModal = ({dialog}: {dialog: HTMLDialogElement | null}) => {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  
  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // compile the form fields into an array of [fieldname, value] tuples
      const formData = new FormData(event.currentTarget);
      const fields = ["email", "name", "password"].map((fieldname) => {
        const value = formData.get(fieldname)?.toString();
        if (value) return [fieldname, value];
        else throw new Error(`${fieldname} is required`);
      });

      // attempt to create a new account using better-auth
      const { data, error } = await signUp.email(Object.fromEntries(fields));
      if (error) throw new Error(error.message, {cause: error});

      // it may be better to store a redirect uri in the search params
      router.push('/routes');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "account could not be created with the provided credentials");
    }
  }, [router, setError]);
  
  return (
    <form onSubmit={onSubmit} className="p-8 w-96">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <label htmlFor="email">Email:</label>
      <input autoFocus id="email" name="email" type="email" placeholder="Enter Email" className="w-full mb-2 p-2 border rounded" />
      <label htmlFor="name">Username:</label>
      <input id="name" name="name" placeholder="Enter Username" className="w-full mb-2 p-2 border rounded" />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" placeholder="Enter Password" minLength={8} maxLength={128} className="w-full mb-4 p-2 border rounded"/>
      {error ? <span className="capitalize">{error}</span> : ""}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => dialog?.close()} className="px-4 py-2 border rounded hover:bg-gray-100">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default SignUpModal;

"use client";

import { useState, useEffect } from "react";
import {
  login,
  searchBreeds,
} from "../components/dogApi";
import { useRouter } from "next/navigation";

export default function Login() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email); // Simple regex to check email format
  };

  const handleLoginIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");
    if (!email) {
      setEmailError("Email is required.");
      return;
    }
    if (!name) {
      setNameError("Name is required.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setNameError("");
    setEmailError("");
    try {
      const response = await login(name, email);
      setLoggedIn(true);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    console.log(name);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    console.log(email);
  };

  useEffect(() => {
    const authenticationTest = async () => {
      try {
        const dogIds = await searchBreeds();
        if (dogIds) {
          router.push("/");
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    authenticationTest();
  }, [router, loggedIn]);

  return (
    <>
      {isAuthenticated === null ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full flex justify-center absolute top-24">
          <form
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            onSubmit={handleLoginIn}
          >
            <label className="block text-gray-700 text-lg font-bold mb-2 text-center">
              Sign In
            </label>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                className={`shadow appearance-none border mb-3 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  emailError ? "border-red-500" : ""
                }`}
                id="username"
                type="text"
                placeholder="Email"
                onChange={handleEmailChange}
              />
              {!validateEmail(email) && (
                <p className="text-red-500 text-xs italic">{emailError}</p>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name
              </label>
              <input
                className={`shadow appearance-none border ${
                  nameError ? "border-red-500" : ""
                } rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                id="text"
                type="password"
                placeholder="Name"
                onChange={handleNameChange}
              />
              {!name && (
                <p className="text-red-500 text-xs italic">{nameError}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

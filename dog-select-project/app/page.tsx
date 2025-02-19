"use client";

import { useState, useEffect } from "react";
import {
  logout,
  searchBreeds,
} from "./components/dogApi";
import { useRouter } from "next/navigation";
import DogTable from "./components/dogTable";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await logout(name, email);
      setLoggedIn(false);
    } catch (error) {
      console.error("Error logging out:", error);
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  useEffect(() => {
    const authenticationTest = async () => {
      try {
        const dogIds = await searchBreeds(); //test to see if logged in
        if (dogIds) {
          setIsAuthenticated(true);
          console.log(isAuthenticated);
        }
        if (!dogIds) {
          setIsAuthenticated(false);
          console.log(isAuthenticated);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        router.push("/login");
      }
    };

    authenticationTest();
  }, [router, loggedIn]);

  return (
    <div>
      {isAuthenticated === null ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className=" flex justify-end sticky top-0 z-[50] bg-gray-600">
            <div className="">
              <button
                onClick={handleLogOut}
                type="button"
                className=" z-[200] text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Log Out
              </button>
            </div>
          </div>
          <div>
            <DogTable />
          </div>
        </>
      )}
    </div>
  );
}

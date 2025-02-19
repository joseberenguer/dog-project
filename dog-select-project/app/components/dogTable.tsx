"use client";

import axios from "axios";
import { useState, useEffect, useRef } from "react";
import {
  searchDogs,
  fetchDogDetails,
  searchBreeds,
  fetchDogMatch,
} from "../components/dogApi";
import { useRouter } from "next/navigation";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export default function DogTable() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [allDogBreeds, setAllDogBreeds] = useState<string[]>([]); // State for selected breeds
  const [dogBreeds, setDogBreeds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dogData, setDogData] = useState<Dog[]>([]);
  const [nextPage, setNextPage] = useState<string | undefined>(undefined);
  const [previousPage, setPreviousPage] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState<number | null>();
  const [totalPages, setTotalPages] = useState<number>();

  const [dogMatch, setDogMatch] = useState<{
    id: string | null;
    image: string | null;
  }>({
    id: null,
    image: null,
  });

  const [dogList, setDogList] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const router = useRouter();

  const handleSearch = async (newSortField?: string) => {
    try {
      if (newSortField) {
        const newOrder =
          newSortField === sortField
            ? sortOrder === "asc"
              ? "desc"
              : "asc"
            : "asc";

        setSortField(newSortField || null);
        setSortOrder(newOrder);

        const sort = newSortField
          ? { field: newSortField, order: newOrder }
          : undefined;

        const { next, prev, resultIds, total } = await searchDogs(
          dogBreeds,
          undefined,
          undefined,
          undefined,
          undefined,
          sort,
          undefined
        );
        if (resultIds.length === 0) {
          console.log("No dogs found.");
          return;
        }
        const dogDetails: Dog[] = await fetchDogDetails(resultIds);
        setTotalPages(total);
        setNextPage(next);
        setDogData(dogDetails);
        const match = next.match(/(\d+)$/);
        const lastNumber = match ? match[0] : null;
        setCurrentPage(Number(lastNumber));
      } else {
        const { next, prev, resultIds, total } = await searchDogs(dogBreeds);
        if (resultIds.length === 0) {
          console.log("No dogs found.");
          return;
        }
        const dogDetails: Dog[] = await fetchDogDetails(resultIds);
        setTotalPages(total);
        setNextPage(next);
        setDogData(dogDetails);
        const match = next.match(/(\d+)$/);
        const lastNumber = match ? match[0] : null;
        setCurrentPage(Number(lastNumber));
      }
    } catch (error) {
      console.error("Error searching dogs:", error);
    }
  };

  const handleMatch = async () => {
    try {
      const matchId = await fetchDogMatch(dogList);
      const dogDetails: Dog[] = await fetchDogDetails([matchId.match]);
      setDogData(dogDetails);
    } catch (error) {
      console.error("Error searching dogs:", error);
    }
  };

  const handleNext = async () => {
    try {
      const { next, prev, resultIds, total } = await searchDogs(
        dogBreeds,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        nextPage
      );

      const dogDetails: Dog[] = await fetchDogDetails(resultIds);
      setNextPage(next ? next : "");
      setPreviousPage(prev ? prev : "");
      setDogData(dogDetails);

      const match = next.match(/(\d+)$/);
      const lastNumber = match ? match[0] : null;
      setCurrentPage(Number(lastNumber));
    } catch (error) {
      console.error("Error searching dogs:", error);
    }
  };

  const handlePrevious = async () => {
    try {
      const { next, prev, resultIds, total } = await searchDogs(
        dogBreeds,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        previousPage
      );

      const dogDetails: Dog[] = await fetchDogDetails(resultIds);
      setNextPage(next ? next : "");
      setPreviousPage(prev ? prev : "");
      setDogData(dogDetails);
      const match = next.match(/(\d+)$/);
      const lastNumber = match ? match[0] : null;
      setCurrentPage(Number(lastNumber));
    } catch (error) {
      console.error("Error searching dogs:", error);
    }
  };

  const handleDropdownCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const breed = event.target.value;
    setDogBreeds(
      (prev) =>
        event.target.checked
          ? [...prev, breed] // Add breed if checked
          : prev.filter((b) => b !== breed) // Remove breed if unchecked
    );
  };

  const handleDogCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const dogid = event.target.value;
    setDogList(
      (prev) =>
        event.target.checked
          ? [...prev, dogid] // Add breed if checked
          : prev.filter((b) => b !== dogid) // Remove breed if unchecked
    );
  };

  const handleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dogIds = await searchBreeds(); //test to see if logged in
        setAllDogBreeds(dogIds);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <div className="sticky top-[0px] z-[100] bg-gray-600">
        <button
          onClick={() => handleSearch()}
          type="button"
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          Dog Search
        </button>

        {/* dropdown */}
        <button
          id="dropdownSearchButton"
          data-dropdown-toggle="dropdownSearch"
          data-dropdown-placement="bottom"
          className="me-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
          onClick={handleDropdown}
        >
          Dropdown search{" "}
          <svg
            className="w-2.5 h-2.5 ms-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <button
          onClick={handleMatch}
          type="button"
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          Match
        </button>
      </div>
      <div className="sticky top-[0px] z-[100] bg-gray-600"></div>
      <div className="sticky top-[50px] z-[100]">
        <div
          id="dropdownSearch"
          className={`bg-white rounded-lg shadow-sm w-60 dark:bg-gray-700 absolute ${
            !showDropdown ? "hidden" : ""
          }`}
          ref={dropdownRef}
        >
          <ul
            className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownSearchButton"
          >
            {allDogBreeds.map((breed, index) => (
              <li key={index}>
                <div className="flex items-center ps-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                  <input
                    id={breed}
                    type="checkbox"
                    value={breed}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    onChange={handleDropdownCheckboxChange}
                  />
                  <label
                    htmlFor={breed}
                    className="w-full py-2 ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                  >
                    {breed}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* table */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <label htmlFor="checkbox-all-search" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th scope="col" className="sm:px-2 md:px-6 py-3">
                <div className="flex items-center">Image</div>
              </th>
              <th scope="col" className="sm:px-2 md:px-6 py-3">
                <div className="flex items-center">
                  Name
                  <a href="#">
                    <svg
                      className="w-3 h-3 ms-1.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      onClick={() => handleSearch("name")}
                    >
                      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                    </svg>
                  </a>
                </div>
              </th>
              <th scope="col" className="sm:px-2 md:px-6 py-3">
                <div className="flex items-center">
                  Age
                  <a href="#">
                    <svg
                      className="w-3 h-3 ms-1.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      onClick={() => handleSearch("age")}
                    >
                      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                    </svg>
                  </a>
                </div>
              </th>
              <th scope="col" className="sm:px-2 md:px-6 py-3">
                <div className="flex items-center">Zip_Code</div>
              </th>
              <th scope="col" className="sm:px-2 md:px-6 py-3">
                <div className="flex items-center">
                  Breed
                  <a href="#">
                    <svg
                      className="w-3 h-3 ms-1.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      onClick={() => handleSearch("breed")}
                    >
                      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                    </svg>
                  </a>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {dogData.map((dog) => (
              <tr
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                key={dog.id}
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input
                      id="checkbox-table-search-1"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      onChange={handleDogCheckboxChange}
                      value={dog.id}
                      checked={dogList.includes(dog.id)}
                    />
                    <label
                      htmlFor="checkbox-table-search-1"
                      className="sr-only"
                    >
                      checkbox
                    </label>
                  </div>
                </td>
                <td
                  scope="row"
                  className="sm:px-2 md:px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <img src={dog.img}></img>
                </td>
                <td className="px-[5px] py-4">{dog.name}</td>
                <td className="px-[5px] py-4">{dog.age}</td>
                <td className="px-[5px] py-4">{dog.zip_code}</td>
                <td className="px-[5px] py-4">{dog.breed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* pagination */}
      <div className="flex flex-col items-center bg-gray-600">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {currentPage && currentPage !== 25 && currentPage > 25
              ? currentPage - 25
              : 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {currentPage ? currentPage : 1}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalPages}
          </span>{" "}
          Entries
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          <button
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={handlePrevious}
          >
            Prev
          </button>
          <button
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

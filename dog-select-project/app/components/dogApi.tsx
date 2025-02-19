import axios from "axios";
import PreviousMap_ from "postcss/lib/previous-map";
interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export const login = async (name: string, email: string) => {
  try {
    const response = await axios.post(
      "https://frontend-take-home-service.fetch.com/auth/login",
      { name, email },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = async (name: string, email: string) => {
  try {
    await axios.post(
      "https://frontend-take-home-service.fetch.com/auth/logout",
      { name, email },
      { withCredentials: true }
    );
  } catch (error) {
    throw error;
  }
};

export const searchDogs = async (
  breed?: string[],
  zipCode?: number,
  ageMin?: number,
  ageMax?: number,
  size: number = 25,
  sort?: { field: string; order: string },
  next?: string,
  previous?: string
) => {
  try {
    const baseUrl = "https://frontend-take-home-service.fetch.com";

    let url = `${baseUrl}/dogs/search`;

    if (next) {
      url = `${baseUrl}${next}`;
    } else if (previous) {
      url = `${baseUrl}${previous}`;
    }

    const params: Record<string, any> = {};

    if (!next && !previous) {
      if (breed) params.breeds = breed;
      if (zipCode) params.zipCodes = zipCode;
      if (ageMin) params.ageMin = ageMin;
      if (ageMax) params.ageMax = ageMax;
      (params.size = size),
        (params.sort = `${sort ? sort.field : "breed"}:${
          sort ? sort.order : "asc"
        }`);
    }

    const searchResponse = await axios.get<{
      next: string;
      prev?: string;
      resultIds: string[];
      total: number;
    }>(url, {
      params: params,
      withCredentials: true,
    });
    return {
      next: searchResponse.data.next,
      prev: searchResponse.data.prev ?? null,
      resultIds: searchResponse.data.resultIds,
      total: searchResponse.data.total,
    };
  } catch (error) {
    throw error;
  }
};

export const searchBreeds = async () => {
  try {
    const searchResponse = await axios.get(
      "https://frontend-take-home-service.fetch.com/dogs/breeds",
      {
        withCredentials: true,
      }
    );
    return searchResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDogDetails = async (dogIds: string[]): Promise<Dog[]> => {
  try {
    const response = await axios.post<Dog[]>(
      "https://frontend-take-home-service.fetch.com/dogs",
      dogIds,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDogMatch = async (dogIds: string[]) => {
  try {
    const response = await axios.post(
      "https://frontend-take-home-service.fetch.com/dogs/match",
      dogIds,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

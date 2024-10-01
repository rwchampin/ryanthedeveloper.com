// hooks/useAxiosSWR.ts
import useSWR from 'swr';
import axiosInstance from '@/lib/utils/axios';

const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

/**
 * Custom hook for fetching data from a specified URL.
 *
 * @param url - The URL to fetch data from.
 * @returns An object containing the fetched data, any error that occurred, the loading state, and the validation state.
 */
export function useFetch(url: string) {
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    error,
    isLoading: !error && !data,
    isValidating,
  };
}
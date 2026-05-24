import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useBalance() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/balance',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    balance: data?.balance || 0,
    isLoading,
    error,
    mutate,
  }
}

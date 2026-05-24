import useSWR from 'swr'

interface Stock {
  id: string
  symbol: string
  name: string
  current_price: number
  created_at: string
  updated_at: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useStocks() {
  const { data, error, isLoading, mutate } = useSWR<Stock[]>(
    '/api/stocks',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  return {
    stocks: data || [],
    isLoading,
    error,
    mutate,
  }
}

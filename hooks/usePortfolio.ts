import useSWR from 'swr'

export interface PortfolioItem {
  id: string
  user_id: string
  stock_id: string
  quantity: number
  symbol: string
  name: string
  current_price: number
  total_value: number
  created_at: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function usePortfolio() {
  const { data, error, isLoading, mutate } = useSWR<PortfolioItem[]>(
    '/api/portfolio',
    fetcher,
    { revalidateOnFocus: true }
  )

  const portfolio = (data || []).map((item) => ({
    ...item,
    current_price: Number.parseFloat(String(item.current_price)),
    total_value: Number.parseFloat(String(item.total_value ?? 0)),
  }))

  return {
    portfolio,
    isLoading,
    error,
    mutate,
  }
}

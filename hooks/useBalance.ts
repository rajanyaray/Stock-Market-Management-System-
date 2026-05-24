import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useBalance() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/balance',
    fetcher,
    { revalidateOnFocus: false }
  )

  const balanceValue = typeof data?.balance === 'string'
    ? Number.parseFloat(data.balance)
    : typeof data?.balance === 'number'
      ? data.balance
      : 0

  return {
    balance: Number.isFinite(balanceValue) ? balanceValue : 0,
    isLoading,
    error,
    mutate,
  }
}

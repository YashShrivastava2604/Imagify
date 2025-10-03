import { api } from './api'

export const checkoutCredits = async (transaction) => {
  const result = await api.post('/transactions/checkout', transaction)
  window.location.href = result.url
}
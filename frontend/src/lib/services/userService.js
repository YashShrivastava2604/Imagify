import { api } from './api'

export const getUserById = async (userId) => {
  return api.get(`/users/${userId}`)
}

export const updateCredits = async (userId, creditFee) => {
  return api.patch(`/users/${userId}/credits`, { creditFee })
}

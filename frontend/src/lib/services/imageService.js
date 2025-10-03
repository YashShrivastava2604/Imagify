import { api } from './api'

export const getAllImages = async (page = 1, searchQuery = '') => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  if (searchQuery) params.append('searchQuery', searchQuery)
  
  return api.get(`/images?${params.toString()}`)
}

export const getImageById = async (imageId) => {
  return api.get(`/images/${imageId}`)
}

export const getUserImages = async (page = 1, userId) => {
  return api.get(`/images/user/${userId}?page=${page}`)
}

export const addImage = async (image, userId, path) => {
  return api.post('/images', { image, userId, path })
}

export const updateImage = async (image, userId, path) => {
  return api.put(`/images/${image.id}`, { image, userId, path })
}

export const deleteImage = async (imageId) => {
  return api.delete(`/images/${imageId}`)
}

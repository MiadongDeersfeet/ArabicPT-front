import { httpClient } from './httpClient.js'

export const getSets = async () => {
  const response = await httpClient.get('/api/sets')
  return response.data.data
}

export const getSetsByFolder = async (folderId) => {
  const response = await httpClient.get('/api/sets', {
    params: { folderId },
  })
  return response.data.data
}

export const getSet = async (setId) => {
  const response = await httpClient.get(`/api/sets/${setId}`)
  return response.data.data
}

export const createSet = async (data) => {
  const response = await httpClient.post('/api/sets', data)
  return response.data.data
}

export const updateSet = async (setId, data) => {
  const response = await httpClient.patch(`/api/sets/${setId}`, data)
  return response.data.data
}

export const deleteSet = async (setId) => {
  const response = await httpClient.delete(`/api/sets/${setId}`)
  return response.data
}

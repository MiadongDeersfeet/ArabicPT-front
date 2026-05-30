import { httpClient } from './httpClient.js'

export const getParagraphSets = async (params = {}) => {
  const response = await httpClient.get('/api/paragraph-sets', { params })
  return response.data.data
}

export const getParagraphSet = async (paragraphSetId) => {
  const response = await httpClient.get(`/api/paragraph-sets/${paragraphSetId}`)
  return response.data.data
}

export const createParagraphSet = async (data) => {
  const response = await httpClient.post('/api/paragraph-sets', data)
  return response.data.data
}

export const updateParagraphSet = async (paragraphSetId, data) => {
  const response = await httpClient.patch(`/api/paragraph-sets/${paragraphSetId}`, data)
  return response.data.data
}

export const deleteParagraphSet = async (paragraphSetId) => {
  const response = await httpClient.delete(`/api/paragraph-sets/${paragraphSetId}`)
  return response.data
}

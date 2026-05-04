import { httpClient } from './httpClient.js'

export const getSentencesBySet = async (setId) => {
  const response = await httpClient.get(`/api/sets/${setId}/sentences`)
  return response.data.data
}

export const createSentence = async (setId, data) => {
  const response = await httpClient.post(`/api/sets/${setId}/sentences`, data)
  return response.data.data
}

export const getSentence = async (sentenceId) => {
  const response = await httpClient.get(`/api/sentences/${sentenceId}`)
  return response.data.data
}

export const updateSentence = async (sentenceId, data) => {
  const response = await httpClient.patch(`/api/sentences/${sentenceId}`, data)
  return response.data.data
}

export const deleteSentence = async (sentenceId) => {
  const response = await httpClient.delete(`/api/sentences/${sentenceId}`)
  return response.data
}

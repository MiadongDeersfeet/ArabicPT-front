import { httpClient } from './httpClient.js'

export const getSentenceAudio = async (sentenceId) => {
  const response = await httpClient.get(`/api/sentences/${sentenceId}/audio`)
  return response.data.data
}

export const generateSentenceAudio = async (sentenceId) => {
  const response = await httpClient.post(`/api/sentences/${sentenceId}/audio`)
  return response.data.data
}

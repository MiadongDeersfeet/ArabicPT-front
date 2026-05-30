import { httpClient } from './httpClient.js'

export const getParagraphAudio = async (paragraphId) => {
  const response = await httpClient.get(`/api/paragraphs/${paragraphId}/audio`)
  return response.data.data
}

export const createParagraphAudio = async (paragraphId) => {
  const response = await httpClient.post(`/api/paragraphs/${paragraphId}/audio`)
  return response.data.data
}

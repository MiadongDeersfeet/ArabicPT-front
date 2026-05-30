import { httpClient } from './httpClient.js'

export const getParagraphsBySet = async (paragraphSetId) => {
  const response = await httpClient.get(`/api/paragraph-sets/${paragraphSetId}/paragraphs`)
  return response.data.data
}

export const getParagraph = async (paragraphId) => {
  const response = await httpClient.get(`/api/paragraphs/${paragraphId}`)
  return response.data.data
}

export const createParagraph = async (paragraphSetId, data) => {
  const response = await httpClient.post(`/api/paragraph-sets/${paragraphSetId}/paragraphs`, data)
  return response.data.data
}

export const updateParagraph = async (paragraphId, data) => {
  const response = await httpClient.patch(`/api/paragraphs/${paragraphId}`, data)
  return response.data.data
}

export const deleteParagraph = async (paragraphId) => {
  const response = await httpClient.delete(`/api/paragraphs/${paragraphId}`)
  return response.data
}

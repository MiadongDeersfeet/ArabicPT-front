import { httpClient } from './httpClient.js'

export const getFolders = async () => {
  const response = await httpClient.get('/api/folders')
  return response.data.data
}

export const getFolder = async (folderId) => {
  const response = await httpClient.get(`/api/folders/${folderId}`)
  return response.data.data
}

export const createFolder = async (data) => {
  const response = await httpClient.post('/api/folders', data)
  return response.data.data
}

export const updateFolder = async (folderId, data) => {
  const response = await httpClient.patch(`/api/folders/${folderId}`, data)
  return response.data.data
}

export const deleteFolder = async (folderId) => {
  const response = await httpClient.delete(`/api/folders/${folderId}`)
  return response.data
}

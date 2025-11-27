import api from './api'

export interface VehicleEntryPhoto {
  id: string
  entryId: string
  url: string
  description?: string
  photoType: string
  uploadedAt: string
}

export const photoService = {
  async getEntryPhotos(entryId: string): Promise<VehicleEntryPhoto[]> {
    const response = await api.get(`/photos/entries/${entryId}`)
    return response.data.data || []
  },

  async addEntryPhoto(entryId: string, url: string, photoType: string, description?: string): Promise<VehicleEntryPhoto> {
    const response = await api.post(`/photos/entries/${entryId}`, {
      url,
      photoType,
      description,
    })
    return response.data.data
  },
}

export default photoService


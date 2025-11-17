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
}

export default photoService


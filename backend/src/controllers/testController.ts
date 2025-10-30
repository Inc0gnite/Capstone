// Endpoint de prueba simple para verificar que el backend funciona
import { Request, Response } from 'express'

export const testController = {
  async test(_req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Backend funcionando correctamente',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en el backend',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }
}


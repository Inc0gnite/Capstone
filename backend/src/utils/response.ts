import { Response } from 'express'
import type { ApiResponse, PaginatedResponse } from '../types'

/**
 * Envía una respuesta exitosa estándar
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  return res.status(statusCode).json(response)
}

/**
 * Envía una respuesta de error estándar
 */
export function sendError(
  res: Response,
  error: string,
  statusCode = 400
) {
  const response: ApiResponse = {
    success: false,
    error,
  }
  return res.status(statusCode).json(response)
}

/**
 * Envía una respuesta paginada
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const response: PaginatedResponse<T> = {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
  return res.status(200).json(response)
}

/**
 * Maneja errores de Prisma y los convierte en mensajes legibles
 */
export function handlePrismaError(error: any): string {
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'campo'
    return `Ya existe un registro con ese ${field}`
  }

  if (error.code === 'P2025') {
    return 'Registro no encontrado'
  }

  if (error.code === 'P2003') {
    return 'Error de relación: el registro relacionado no existe'
  }

  return error.message || 'Error en la base de datos'
}



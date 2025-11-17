import { useState, useEffect } from 'react'

interface WorkPause {
  id: string
  pausedAt: string
  resumedAt?: string
  reason?: string
}

interface WorkOrderTimerProps {
  startedAt?: string
  completedAt?: string
  currentStatus: string
  pauses?: WorkPause[]
}

export function WorkOrderTimer({
  startedAt,
  completedAt,
  currentStatus,
  pauses = []
}: WorkOrderTimerProps) {
  const [activeTime, setActiveTime] = useState(0)
  const [pauseTime, setPauseTime] = useState(0)
  const [currentPauseTime, setCurrentPauseTime] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      return
    }

    const calculateTimes = () => {
      const now = new Date()
      const startDate = new Date(startedAt)
      const endDate = completedAt ? new Date(completedAt) : now

      // Calcular tiempo total transcurrido
      const totalElapsed = endDate.getTime() - startDate.getTime()

      // Calcular tiempo total en pausa (pausas completadas)
      let totalPauseTime = 0
      pauses.forEach((pause) => {
        if (pause.resumedAt) {
          // Pausa completada
          const pauseStart = new Date(pause.pausedAt)
          const pauseEnd = new Date(pause.resumedAt)
          totalPauseTime += pauseEnd.getTime() - pauseStart.getTime()
        }
      })

      // Si está actualmente pausado, agregar tiempo de pausa actual
      let currentPause = 0
      if (currentStatus === 'pausado' && !completedAt) {
        const activePause = pauses.find((p) => !p.resumedAt)
        if (activePause) {
          const pauseStart = new Date(activePause.pausedAt)
          currentPause = now.getTime() - pauseStart.getTime()
        }
      }

      // Tiempo activo = tiempo total - tiempo en pausa
      const active = totalElapsed - totalPauseTime - currentPause

      setActiveTime(Math.max(0, active))
      setPauseTime(totalPauseTime)
      setCurrentPauseTime(currentPause)
    }

    calculateTimes()

    // Actualizar cada segundo si la orden está activa
    if (!completedAt && currentStatus !== 'cancelado') {
      const interval = setInterval(calculateTimes, 1000)
      return () => clearInterval(interval)
    }
  }, [startedAt, completedAt, currentStatus, pauses])

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatTimeDetailed = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const parts: string[] = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    parts.push(`${seconds}s`)

    return parts.join(' ')
  }

  if (!startedAt) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⏱️</span>
          <div>
            <p className="text-sm font-medium text-gray-700">Tiempo de Trabajo</p>
            <p className="text-xs text-gray-500">La orden aún no ha sido iniciada</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-3xl">⏱️</span>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tiempo de Trabajo</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {currentStatus === 'pausado' && !completedAt
              ? 'Orden en pausa'
              : currentStatus === 'completado'
              ? 'Orden completada'
              : 'Tiempo activo'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Tiempo Activo */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 text-lg">▶️</span>
            <div>
              <p className="text-xs font-medium text-blue-900">Tiempo Activo</p>
              <p className="text-xs text-blue-700">Trabajo realizado</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-blue-900">
              {formatTime(activeTime)}
            </p>
            <p className="text-xs text-blue-600">
              {formatTimeDetailed(activeTime)}
            </p>
          </div>
        </div>

        {/* Tiempo en Pausa (si hay) */}
        {(pauseTime > 0 || currentPauseTime > 0) && (
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <span className="text-orange-600 text-lg">⏸️</span>
              <div>
                <p className="text-xs font-medium text-orange-900">Tiempo en Pausa</p>
                <p className="text-xs text-orange-700">
                  {currentStatus === 'pausado' && !completedAt && currentPauseTime > 0
                    ? 'Pausa actual'
                    : 'Pausas anteriores'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold text-orange-900">
                {formatTime(pauseTime + currentPauseTime)}
              </p>
              <p className="text-xs text-orange-600">
                {formatTimeDetailed(pauseTime + currentPauseTime)}
              </p>
            </div>
          </div>
        )}

        {/* Tiempo Total */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-lg">📊</span>
            <div>
              <p className="text-xs font-medium text-gray-900">Tiempo Total</p>
              <p className="text-xs text-gray-600">Desde el inicio</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {formatTime(activeTime + pauseTime + currentPauseTime)}
            </p>
            <p className="text-xs text-gray-600">
              {formatTimeDetailed(activeTime + pauseTime + currentPauseTime)}
            </p>
          </div>
        </div>

        {/* Información adicional de pausas */}
        {pauses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Historial de Pausas ({pauses.length})
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pauses.map((pause, index) => {
                const pauseStart = new Date(pause.pausedAt)
                const pauseEnd = pause.resumedAt ? new Date(pause.resumedAt) : new Date()
                const duration = pauseEnd.getTime() - pauseStart.getTime()
                const isActive = !pause.resumedAt && currentStatus === 'pausado'

                return (
                  <div
                    key={pause.id}
                    className={`text-xs p-2 rounded ${
                      isActive ? 'bg-orange-100 border border-orange-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          Pausa #{pauses.length - index}
                          {isActive && ' (Activa)'}
                        </p>
                        {pause.reason && (
                          <p className="text-gray-600 mt-1">Razón: {pause.reason}</p>
                        )}
                        <p className="text-gray-500 mt-1">
                          {pauseStart.toLocaleString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatTime(duration)}
                        </p>
                        {isActive && (
                          <p className="text-orange-600 text-xs mt-1">En curso...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


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
      
      // Validar que startedAt sea válido
      if (isNaN(startDate.getTime())) {
        console.error('❌ startedAt inválido:', startedAt)
        return
      }

      // Usar completedAt si existe, sino usar now
      const endDate = completedAt ? new Date(completedAt) : now
      
      // Validar que endDate sea válido
      if (isNaN(endDate.getTime())) {
        console.error('❌ endDate inválido:', completedAt || 'now')
        return
      }

      // Calcular tiempo total transcurrido desde que se inició
      const totalElapsed = Math.max(0, endDate.getTime() - startDate.getTime())
      
      // Verificar si startedAt es razonable (no más de 7 días antes de ahora)
      const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceStart > 7) {
        console.warn('⚠️ ADVERTENCIA: startedAt es muy antiguo:', {
          startedAt: startDate.toISOString(),
          daysSinceStart: daysSinceStart.toFixed(2),
          message: 'El tiempo activo podría estar calculándose incorrectamente. Verificar que startedAt se estableció cuando la orden pasó a "en_progreso"'
        })
      }
      
      // Debug: Log detallado
      console.log('⏱️ DEBUG - Cálculo de tiempos:', {
        startedAt: startDate.toISOString(),
        now: now.toISOString(),
        endDate: endDate.toISOString(),
        totalElapsedMs: totalElapsed,
        totalElapsedHours: (totalElapsed / (1000 * 60 * 60)).toFixed(2),
        daysSinceStart: daysSinceStart.toFixed(2),
        currentStatus,
        pausesCount: pauses.length,
        pauses: pauses.map(p => ({
          pausedAt: p.pausedAt,
          resumedAt: p.resumedAt,
          reason: p.reason
        }))
      })

      // Calcular tiempo total en pausa (pausas completadas)
      let totalPauseTime = 0
      pauses.forEach((pause) => {
        if (pause.resumedAt) {
          // Pausa completada
          const pauseStart = new Date(pause.pausedAt)
          const pauseEnd = new Date(pause.resumedAt)
          
          // Validar fechas de pausa y que estén dentro del rango de trabajo
          if (!isNaN(pauseStart.getTime()) && !isNaN(pauseEnd.getTime())) {
            // Solo contar pausas que ocurrieron después de startedAt
            if (pauseStart.getTime() >= startDate.getTime()) {
              const pauseDuration = pauseEnd.getTime() - pauseStart.getTime()
              if (pauseDuration > 0) {
                totalPauseTime += pauseDuration
              }
            }
          }
        }
      })

      // Si está actualmente pausado, agregar tiempo de pausa actual
      let currentPause = 0
      if (currentStatus === 'pausado' && !completedAt) {
        const activePause = pauses.find((p) => !p.resumedAt)
        if (activePause) {
          const pauseStart = new Date(activePause.pausedAt)
          if (!isNaN(pauseStart.getTime()) && pauseStart.getTime() >= startDate.getTime()) {
            currentPause = Math.max(0, now.getTime() - pauseStart.getTime())
          }
        }
      }

      // Calcular tiempo activo: solo cuenta cuando está en "en_progreso"
      let activeTime = 0
      
      // Si la orden está pausada, no contar tiempo activo adicional
      if (currentStatus === 'pausado' && !completedAt) {
        // Solo contar períodos activos antes de la pausa actual
        const sortedPauses = [...pauses].sort((a, b) => 
          new Date(a.pausedAt).getTime() - new Date(b.pausedAt).getTime()
        )
        
        let currentTime = startDate.getTime()
        
        for (const pause of sortedPauses) {
          const pauseStart = new Date(pause.pausedAt).getTime()
          
          // Si la pausa es después del tiempo actual, sumar período activo hasta la pausa
          if (pauseStart > currentTime) {
            activeTime += pauseStart - currentTime
          }
          
          // Si la pausa está reanudada, actualizar currentTime al momento de reanudación
          if (pause.resumedAt) {
            const pauseEnd = new Date(pause.resumedAt).getTime()
            if (pauseEnd > pauseStart) {
              currentTime = pauseEnd
            }
          } else {
            // Si la pausa no está reanudada, detener aquí (es la pausa actual)
            break
          }
        }
      } else {
        // Si está en progreso o completada, calcular todos los períodos activos
        const sortedPauses = [...pauses].sort((a, b) => 
          new Date(a.pausedAt).getTime() - new Date(b.pausedAt).getTime()
        )
        
        // Calcular períodos activos (entre startedAt y primera pausa, entre pausas, y desde última reanudación)
        let currentTime = startDate.getTime()
        const endTime = completedAt ? endDate.getTime() : now.getTime()
        
        for (const pause of sortedPauses) {
          const pauseStart = new Date(pause.pausedAt).getTime()
          
          // Si la pausa es después del tiempo actual, sumar período activo hasta la pausa
          if (pauseStart > currentTime && pauseStart <= endTime) {
            activeTime += pauseStart - currentTime
          }
          
          // Si la pausa está reanudada, actualizar currentTime al momento de reanudación
          if (pause.resumedAt) {
            const pauseEnd = new Date(pause.resumedAt).getTime()
            if (pauseEnd > pauseStart) {
              currentTime = pauseEnd
            }
          } else {
            // Si la pausa no está reanudada, detener aquí
            currentTime = pauseStart
            break
          }
        }
        
        // Si estamos en progreso y no hay pausa activa, sumar tiempo desde última reanudación hasta ahora
        if (currentStatus === 'en_progreso' && !completedAt) {
          activeTime += Math.max(0, endTime - currentTime)
        } else if (completedAt && currentTime < endTime) {
          // Si está completada, sumar cualquier tiempo activo restante
          activeTime += Math.max(0, endTime - currentTime)
        }
      }

      // Tiempo en pausa total
      const totalPause = totalPauseTime + currentPause
      
      // Tiempo total = tiempo activo + tiempo en pausa
      const totalTime = activeTime + totalPause
      
      // Debug: Log de resultados
      console.log('⏱️ DEBUG - Resultados finales:', {
        activeTimeMs: activeTime,
        activeTimeHours: (activeTime / (1000 * 60 * 60)).toFixed(2),
        totalPauseTimeMs: totalPauseTime,
        totalPauseTimeHours: (totalPauseTime / (1000 * 60 * 60)).toFixed(2),
        currentPauseMs: currentPause,
        currentPauseHours: (currentPause / (1000 * 60 * 60)).toFixed(2),
        totalPauseMs: totalPause,
        totalPauseHours: (totalPause / (1000 * 60 * 60)).toFixed(2),
        totalTimeMs: totalTime,
        totalTimeHours: (totalTime / (1000 * 60 * 60)).toFixed(2),
        totalElapsedMs: totalElapsed,
        totalElapsedHours: (totalElapsed / (1000 * 60 * 60)).toFixed(2)
      })

      setActiveTime(activeTime)
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

        {/* Tiempo en Pausa (siempre mostrar si está pausado o hay pausas) */}
        {(currentStatus === 'pausado' || pauseTime > 0 || currentPauseTime > 0 || pauses.length > 0) && (
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <span className="text-orange-600 text-lg">⏸️</span>
              <div>
                <p className="text-xs font-medium text-orange-900">Tiempo en Pausa</p>
                <p className="text-xs text-orange-700">
                  {currentStatus === 'pausado' && !completedAt
                    ? 'Pausa actual'
                    : pauseTime > 0
                    ? 'Pausas anteriores'
                    : 'Sin tiempo en pausa'}
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
              <p className="text-xs text-gray-600">Activo + Pausa</p>
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


import { useState, useRef, useEffect } from 'react'

interface CameraCaptureProps {
  onPhotoTaken: (photo: string) => void
  onClose: () => void
}

export function CameraCapture({ onPhotoTaken, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      
      // Detectar si es móvil
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Configuración adaptativa según el dispositivo
      const videoConstraints: MediaTrackConstraints = {
        facingMode: 'environment', // Cámara trasera en móviles
      }
      
      // En desktop, usar resolución más alta
      if (!isMobile) {
        videoConstraints.width = { ideal: 1920 }
        videoConstraints.height = { ideal: 1080 }
      } else {
        // En móvil, usar resolución más moderada para mejor rendimiento
        videoConstraints.width = { ideal: 1280, max: 1920 }
        videoConstraints.height = { ideal: 720, max: 1080 }
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Asegurar que el video se ajuste correctamente
        videoRef.current.addEventListener('loadedmetadata', () => {
          if (videoRef.current) {
            videoRef.current.play()
          }
        })
      }
    } catch (error: any) {
      console.error('Error accediendo a la cámara:', error)
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (!context) return

      // Configurar dimensiones del canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Dibujar el frame actual del video en el canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convertir a DataURL con compresión
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      onPhotoTaken(photoDataUrl)
    }
  }

  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    await startCamera()
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-75 text-white p-3 sm:p-4 flex justify-between items-center flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold">📸 Capturar Foto</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-red-400 text-xl sm:text-2xl p-1 sm:p-2"
          aria-label="Cerrar cámara"
        >
          ✕
        </button>
      </div>

      {/* Video Stream */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white text-center p-4 sm:p-6">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📷</div>
            <p className="text-sm sm:text-lg mb-4 px-4">{error}</p>
            <button
              onClick={startCamera}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain sm:object-cover"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                aspectRatio: 'auto'
              }}
            />
          </div>
        )}
        
        {/* Canvas oculto para capturar */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controles */}
      <div className="bg-black bg-opacity-75 p-3 sm:p-4 flex-shrink-0">
        <div className="flex justify-center items-center gap-3 sm:gap-4">
          {/* Botón de captura */}
          <button
            onClick={capturePhoto}
            disabled={!!error}
            className="bg-white hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed p-3 sm:p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            aria-label="Capturar foto"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 sm:border-4 border-gray-300 rounded-full flex items-center justify-center text-lg sm:text-xl">
              📸
            </div>
          </button>

          {/* Botón para cambiar cámara */}
          <button
            onClick={switchCamera}
            disabled={!!error}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-full text-base sm:text-lg transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Cambiar cámara"
          >
            🔄
          </button>
        </div>

        {/* Instrucciones */}
        <div className="text-white text-center mt-2 text-xs sm:text-sm px-2">
          {error ? 'Verifica los permisos de cámara' : 'Toca el botón para capturar la foto'}
        </div>
      </div>
    </div>
  )
}



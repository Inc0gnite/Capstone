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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
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
      <div className="bg-black bg-opacity-75 text-white p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">📸 Capturar Foto</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-red-400 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Video Stream */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white text-center p-4">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Canvas oculto para capturar */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controles */}
      <div className="bg-black bg-opacity-75 p-4">
        <div className="flex justify-center items-center gap-4">
          {/* Botón de captura */}
          <button
            onClick={capturePhoto}
            disabled={!!error}
            className="bg-white hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center">
              📸
            </div>
          </button>

          {/* Botón para cambiar cámara */}
          <button
            onClick={switchCamera}
            disabled={!!error}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-full"
          >
            🔄
          </button>
        </div>

        {/* Instrucciones */}
        <div className="text-white text-center mt-2 text-sm">
          {error ? 'Verifica los permisos de cámara' : 'Toca el botón para capturar la foto'}
        </div>
      </div>
    </div>
  )
}



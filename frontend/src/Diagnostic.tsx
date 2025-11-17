import React from 'react'

export default function Diagnostic() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Diagnóstico del Sistema</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>✅ React está funcionando</h2>
        <p>Si puedes ver este mensaje, React está cargando correctamente.</p>
        
        <h2>🌐 Información del Navegador</h2>
        <p><strong>URL:</strong> {window.location.href}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        
        <h2>📦 Variables de Entorno</h2>
        <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'No definida'}</p>
        <p><strong>NODE_ENV:</strong> {import.meta.env.NODE_ENV || 'No definida'}</p>
        
        <h2>🔧 Estado del LocalStorage</h2>
        <p><strong>accessToken:</strong> {localStorage.getItem('accessToken') ? 'Presente' : 'No presente'}</p>
        <p><strong>refreshToken:</strong> {localStorage.getItem('refreshToken') ? 'Presente' : 'No presente'}</p>
        
        <h2>⏰ Timestamp</h2>
        <p><strong>Hora actual:</strong> {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

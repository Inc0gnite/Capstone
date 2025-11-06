import { WorkOrder } from './workOrderService'

export class WordService {
  /**
   * Genera un documento HTML de una orden de trabajo
   */
  static async generateWorkOrderWord(workOrder: WorkOrder): Promise<void> {
    // Validar que la orden esté completada
    if (workOrder.currentStatus !== 'completado') {
      alert('Solo se pueden exportar órdenes de trabajo completadas.')
      return
    }

    // Generar documento HTML directamente
    this.generateHTMLDocument(workOrder)
  }


  /**
   * Genera un documento HTML simple como fallback
   */
  private static generateHTMLDocument(workOrder: WorkOrder): void {
    // Helper functions for labels
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'pendiente': return 'Pendiente'
        case 'en_progreso': return 'En Progreso'
        case 'pausado': return 'Pausado'
        case 'completado': return 'Completado'
        case 'cancelado': return 'Cancelado'
        default: return 'Desconocido'
      }
    }

    const getPriorityLabel = (priority: string) => {
      switch (priority) {
        case 'baja': return 'Baja'
        case 'normal': return 'Normal'
        case 'alta': return 'Alta'
        case 'urgente': return 'Urgente'
        default: return 'Desconocida'
      }
    }

    const getWorkTypeLabel = (workType: string) => {
      switch (workType) {
        case 'mantenimiento': return 'Mantenimiento'
        case 'reparacion': return 'Reparación'
        case 'revision': return 'Revisión'
        case 'otro': return 'Otro'
        default: return 'Desconocido'
      }
    }

    // Crear el HTML del documento
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Orden de Trabajo - ${workOrder.orderNumber}</title>
        <style>
          /* Estilos generales para pantalla */
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #1e40af;
            color: white;
            border-radius: 8px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header h2 {
            margin: 10px 0 0 0;
            font-size: 18px;
            font-weight: normal;
            opacity: 0.9;
          }
          .order-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #1e40af;
          }
          .order-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .order-date {
            color: #6b7280;
            font-size: 16px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #1e40af;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .info-table th,
          .info-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-table th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
            width: 30%;
          }
          .info-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .description {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #10b981;
            margin-bottom: 20px;
          }
          .observations {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
            margin-bottom: 20px;
          }
          .progress {
            background-color: #d1fae5;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #10b981;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          .status-completed {
            color: #059669;
            font-weight: bold;
          }
          .no-data {
            color: #6b7280;
            font-style: italic;
          }
          .no-data-error {
            color: #dc2626;
            font-style: italic;
          }

          /* Estilos específicos para impresión */
          @media print {
            body {
              margin: 0;
              padding: 20px;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }
            
            .header {
              background-color: #1e40af !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-inside: avoid;
              margin-bottom: 20px;
              border-radius: 0;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .header h2 {
              font-size: 16px;
            }
            
            .order-info {
              background-color: #f8fafc !important;
              border-left: 4px solid #1e40af !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-inside: avoid;
              border-radius: 0;
              margin-bottom: 20px;
            }
            
            .order-number {
              font-size: 20px;
              color: #1e40af !important;
            }
            
            .order-date {
              font-size: 14px;
            }
            
            .section {
              page-break-inside: avoid;
              margin-bottom: 20px;
            }
            
            .section-title {
              color: #1e40af !important;
              border-bottom: 2px solid #1e40af !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-after: avoid;
              font-size: 18px;
              margin-bottom: 10px;
            }
            
            .info-table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid;
              margin-bottom: 15px;
            }
            
            .info-table th,
            .info-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 11px;
            }
            
            .info-table th {
              background-color: #f3f4f6 !important;
              font-weight: bold;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .info-table tr:nth-child(even) {
              background-color: #f9fafb !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .description {
              background-color: #f8fafc !important;
              border-left: 4px solid #10b981 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-inside: avoid;
              border-radius: 0;
              margin-bottom: 15px;
              padding: 12px;
            }
            
            .observations {
              background-color: #fef3c7 !important;
              border-left: 4px solid #f59e0b !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-inside: avoid;
              border-radius: 0;
              margin-bottom: 15px;
              padding: 12px;
            }
            
            .progress {
              background-color: #d1fae5 !important;
              border-left: 4px solid #10b981 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-inside: avoid;
              border-radius: 0;
              margin-bottom: 15px;
              padding: 12px;
            }
            
            .footer {
              page-break-before: avoid;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 10px;
            }
            
            .status-completed {
              color: #059669 !important;
              font-weight: bold;
            }
            
            .no-data {
              color: #6b7280 !important;
              font-style: italic;
            }
            
            .no-data-error {
              color: #dc2626 !important;
              font-style: italic;
            }
            
            /* Evitar que las tablas se rompan */
            table {
              page-break-inside: avoid;
            }
            
            /* Ajustar márgenes para impresión */
            @page {
              margin: 1cm;
              size: A4;
            }
            
            /* Ocultar elementos no necesarios en impresión */
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>ORDEN DE TRABAJO</h1>
          <h2>Sistema de Gestión de Taller - PepsiCo Fleet</h2>
        </div>

        <!-- Información de la Orden -->
        <div class="order-info">
          <div class="order-number">N° ORDEN: ${workOrder.orderNumber}</div>
          <div class="order-date">Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')}</div>
        </div>

        <!-- Información General -->
        <div class="section">
          <div class="section-title">INFORMACIÓN GENERAL</div>
          <table class="info-table">
            <tr>
              <th>Estado:</th>
              <td class="status-completed">${getStatusLabel(workOrder.currentStatus)}</td>
            </tr>
            <tr>
              <th>Prioridad:</th>
              <td>${getPriorityLabel(workOrder.priority)}</td>
            </tr>
            <tr>
              <th>Tipo de Trabajo:</th>
              <td>${getWorkTypeLabel(workOrder.workType)}</td>
            </tr>
            <tr>
              <th>Fecha de Creación:</th>
              <td>${new Date(workOrder.createdAt).toLocaleDateString('es-CL')}</td>
            </tr>
          </table>
        </div>

        <!-- Información del Vehículo -->
        <div class="section">
          <div class="section-title">INFORMACIÓN DEL VEHÍCULO</div>
          ${workOrder.vehicle ? `
            <table class="info-table">
              <tr>
                <th>Patente:</th>
                <td>${workOrder.vehicle.licensePlate}</td>
              </tr>
              <tr>
                <th>Marca:</th>
                <td>${workOrder.vehicle.brand}</td>
              </tr>
              <tr>
                <th>Modelo:</th>
                <td>${workOrder.vehicle.model}</td>
              </tr>
              <tr>
                <th>Año:</th>
                <td>${workOrder.vehicle.year}</td>
              </tr>
            </table>
          ` : `
            <p class="no-data">Información del vehículo no disponible</p>
          `}
        </div>

        <!-- Mecánico Asignado -->
        <div class="section">
          <div class="section-title">MECÁNICO ASIGNADO</div>
          ${workOrder.assignedTo ? `
            <table class="info-table">
              <tr>
                <th>Nombre:</th>
                <td>${workOrder.assignedTo.firstName} ${workOrder.assignedTo.lastName}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>${workOrder.assignedTo.email}</td>
              </tr>
              <tr>
                <th>ID:</th>
                <td>${workOrder.assignedTo.id}</td>
              </tr>
            </table>
          ` : `
            <p class="no-data-error">Sin mecánico asignado</p>
          `}
        </div>

        <!-- Información del Creador -->
        <div class="section">
          <div class="section-title">INFORMACIÓN DEL CREADOR</div>
          ${workOrder.createdBy ? `
            <table class="info-table">
              <tr>
                <th>Creado por:</th>
                <td>${workOrder.createdBy.firstName} ${workOrder.createdBy.lastName}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>${workOrder.createdBy.email}</td>
              </tr>
              <tr>
                <th>Fecha:</th>
                <td>${new Date(workOrder.createdAt).toLocaleDateString('es-CL')}</td>
              </tr>
              <tr>
                <th>Hora:</th>
                <td>${new Date(workOrder.createdAt).toLocaleTimeString('es-CL')}</td>
              </tr>
            </table>
          ` : `
            <p class="no-data">Información del creador no disponible</p>
          `}
        </div>

        <!-- Descripción del Trabajo -->
        <div class="section">
          <div class="section-title">DESCRIPCIÓN DEL TRABAJO</div>
          <div class="description">
            ${this.formatDescriptionAsList(workOrder.description)}
          </div>
        </div>

        ${workOrder.observations ? `
          <!-- Observaciones -->
          <div class="section">
            <div class="section-title">OBSERVACIONES</div>
            <div class="observations">
              ${workOrder.observations}
            </div>
          </div>
        ` : ''}

        <!-- Progreso del Trabajo -->
        <div class="section">
          <div class="section-title">PROGRESO DEL TRABAJO</div>
          <div class="progress">
            <strong>Estado: ${getStatusLabel(workOrder.currentStatus)} - 100% Completado</strong>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>──────────────────────────────────────────────────</p>
          <p>Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}</p>
          <p>Sistema de Gestión de Taller - PepsiCo Fleet</p>
          <p>Documento generado automáticamente</p>
        </div>
      </body>
      </html>
    `

    // Crear y descargar el archivo HTML
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Orden_${workOrder.orderNumber}_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    alert('Documento HTML generado exitosamente. Puedes abrirlo en Word para convertirlo a .docx si lo necesitas.')
  }

  /**
   * Formatea la descripción como una lista con checkboxes
   */
  private static formatDescriptionAsList(description: string): string {
    const lines = description.split('\n')
    
    return lines.map((line, index) => {
      // Si la línea está vacía, mostrar un espacio
      if (line.trim() === '') {
        return '<div style="height: 8px;"></div>'
      }
      
      // Si la línea empieza con números seguidos de punto, guión o paréntesis, es un item de lista
      if (/^\d+[\.\)\-]\s/.test(line.trim()) || /^[•\-\*]\s/.test(line.trim())) {
        const cleanLine = line.trim().replace(/^\d+[\.\)\-]\s/, '').replace(/^[•\-\*]\s/, '')
        return `
          <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
            <input type="checkbox" style="margin-right: 12px; margin-top: 2px; transform: scale(1.2);" disabled />
            <span style="flex: 1; font-weight: 500; color: #1f2937;">${cleanLine}</span>
          </div>
        `
      }
      
      // Si la línea empieza con espacios (indentación), es un sub-item
      if (/^\s+/.test(line)) {
        return `
          <div style="display: flex; align-items: flex-start; margin-bottom: 8px; margin-left: 24px;">
            <input type="checkbox" style="margin-right: 8px; margin-top: 2px; transform: scale(0.9);" disabled />
            <span style="flex: 1; color: #4b5563; font-size: 14px;">${line.trim()}</span>
          </div>
        `
      }
      
      // Línea normal
      return `<div style="margin-bottom: 8px;">${line.trim()}</div>`
    }).join('')
  }
}

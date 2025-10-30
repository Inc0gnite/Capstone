import jsPDF from 'jspdf'
import { WorkOrder } from './workOrderService'

export class PDFService {
  /**
   * Genera un PDF de una orden de trabajo
   */
  static generateWorkOrderPDF(workOrder: WorkOrder): void {
    // Validar que la orden esté completada
    if (workOrder.currentStatus !== 'completado') {
      alert('Solo se pueden exportar órdenes de trabajo completadas.')
      return
    }

    const doc = new jsPDF()
    
    // Configuración de colores
    const primaryColor = '#1e40af' // Blue-800
    const secondaryColor = '#6b7280' // Gray-500
    const successColor = '#059669' // Green-600
    const warningColor = '#d97706' // Orange-600
    const dangerColor = '#dc2626' // Red-600

    // Función para obtener color según estado
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completado': return successColor
        case 'en_progreso': return primaryColor
        case 'pausado': return warningColor
        case 'cancelado': return dangerColor
        default: return secondaryColor
      }
    }

    // Función para obtener label del estado
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'pendiente': return 'Pendiente'
        case 'en_progreso': return 'En Progreso'
        case 'pausado': return 'Pausado'
        case 'completado': return 'Completado'
        case 'cancelado': return 'Cancelada'
        default: return status
      }
    }

    // Función para obtener label de prioridad
    const getPriorityLabel = (priority: string) => {
      switch (priority) {
        case 'baja': return 'Baja'
        case 'normal': return 'Normal'
        case 'alta': return 'Alta'
        case 'urgente': return 'Urgente'
        default: return priority
      }
    }

    // Función para obtener color de prioridad
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'urgente': return dangerColor
        case 'alta': return warningColor
        case 'normal': return primaryColor
        case 'baja': return successColor
        default: return secondaryColor
      }
    }

    // Función para obtener label de tipo de trabajo
    const getWorkTypeLabel = (workType: string) => {
      switch (workType) {
        case 'mantenimiento': return 'Mantenimiento'
        case 'reparacion': return 'Reparación'
        case 'revision': return 'Revisión'
        case 'otro': return 'Otro'
        default: return workType
      }
    }

    // Header con diseño de plantilla profesional
    doc.setFillColor(primaryColor)
    doc.rect(0, 0, 210, 40, 'F')
    
    // Logo/Título principal
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDEN DE TRABAJO', 20, 25)
    
    // Subtítulo
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistema de Gestión de Taller - PepsiCo Fleet', 20, 32)
    
    // Línea decorativa
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(2)
    doc.line(20, 35, 190, 35)
    
    // Información de la empresa
    doc.setFontSize(10)
    doc.text('Taller Automotriz Profesional', 20, 38)
    doc.text('Tel: +56 9 1234 5678', 120, 38)

    // Información de la orden con formato de plantilla
    let yPosition = 55
    
    // Número de orden destacado con marco
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPosition - 5, 170, 12, 'F')
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1)
    doc.rect(20, yPosition - 5, 170, 12)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`N° ORDEN: ${workOrder.orderNumber}`, 25, yPosition + 2)
    
    // Fecha de emisión
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 120, yPosition + 2)
    
    yPosition += 20

    // PRIMERA PÁGINA - Información principal
    // Verificar si necesitamos cambiar de página antes de continuar
    const pageHeight = doc.internal.pageSize.height
    const estimatedContentHeight = 200 // Altura estimada del contenido restante
    
    if (yPosition + estimatedContentHeight > pageHeight - 50) {
      // Agregar nueva página
      doc.addPage()
      yPosition = 20
      
      // Header de la segunda página
      doc.setFillColor(primaryColor)
      doc.rect(0, 0, 210, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN ADICIONAL', 20, 15)
      
      // Línea decorativa
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.line(20, 18, 190, 18)
      
      yPosition = 35
    }

    // Tabla de información principal con diseño mejorado
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1)
    
    // Header de la tabla con fondo más oscuro
    doc.setFillColor(200, 200, 200)
    doc.rect(20, yPosition - 5, 170, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN GENERAL', 25, yPosition + 2)
    yPosition += 12

    // Filas de información
    const infoData = [
      ['Estado:', getStatusLabel(workOrder.currentStatus)],
      ['Prioridad:', getPriorityLabel(workOrder.priority)],
      ['Tipo de Trabajo:', getWorkTypeLabel(workOrder.workType)],
      ['Fecha de Creación:', new Date(workOrder.createdAt).toLocaleDateString('es-CL')]
    ]

    infoData.forEach((row, index) => {
      // Fondo alternado para filas
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245)
        doc.rect(20, yPosition - 3, 170, 8, 'F')
      }
      
      // Texto con mejor formato
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(row[0] || '', 25, yPosition)
      doc.setFont('helvetica', 'bold')
      doc.text(row[1] || 'N/A', 80, yPosition)
      
      // Líneas de la tabla
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.5)
      doc.line(20, yPosition + 3, 190, yPosition + 3)
      
      yPosition += 8
    })
    
    // Cerrar tabla
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition - 8, 170, yPosition - 50 + 8)
    
    yPosition += 15

    // Sección de información del vehículo con tabla mejorada
    doc.setFillColor(200, 200, 200)
    doc.rect(20, yPosition - 5, 170, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN DEL VEHÍCULO', 25, yPosition + 2)
    yPosition += 12

    if (workOrder.vehicle) {
      const vehicleData = [
        ['Patente:', workOrder.vehicle.licensePlate],
        ['Marca:', workOrder.vehicle.brand],
        ['Modelo:', workOrder.vehicle.model],
        ['Año:', workOrder.vehicle.year.toString()]
      ]

      vehicleData.forEach((row, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245)
          doc.rect(20, yPosition - 3, 170, 8, 'F')
        }
        
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(row[0] || '', 25, yPosition)
        doc.setFont('helvetica', 'bold')
        doc.text(row[1] || 'N/A', 80, yPosition)
        
        doc.setDrawColor(180, 180, 180)
        doc.setLineWidth(0.5)
        doc.line(20, yPosition + 3, 190, yPosition + 3)
        
        yPosition += 8
      })
    } else {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Información del vehículo no disponible', 25, yPosition)
      yPosition += 6
    }
    
    // Cerrar tabla del vehículo
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition - 8, 170, yPosition - 50 + 8)
    
    yPosition += 15

    // Sección de mecánico asignado con tabla mejorada
    doc.setFillColor(200, 200, 200)
    doc.rect(20, yPosition - 5, 170, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('MECÁNICO ASIGNADO', 25, yPosition + 2)
    yPosition += 12

    if (workOrder.assignedTo) {
      const mechanicData = [
        ['Nombre:', `${workOrder.assignedTo.firstName} ${workOrder.assignedTo.lastName}`],
        ['Email:', workOrder.assignedTo.email],
        ['ID:', workOrder.assignedTo.id]
      ]

      mechanicData.forEach((row, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245)
          doc.rect(20, yPosition - 3, 170, 8, 'F')
        }
        
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(row[0] || '', 25, yPosition)
        doc.setFont('helvetica', 'bold')
        doc.text(row[1] || 'N/A', 80, yPosition)
        
        doc.setDrawColor(180, 180, 180)
        doc.setLineWidth(0.5)
        doc.line(20, yPosition + 3, 190, yPosition + 3)
        
        yPosition += 8
      })
    } else {
      doc.setTextColor('#dc2626')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Sin mecánico asignado', 25, yPosition)
      doc.setTextColor(0, 0, 0)
      yPosition += 6
    }
    
    // Cerrar tabla del mecánico
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition - 8, 170, yPosition - 50 + 8)
    
    yPosition += 15

    // Sección de información del creador con tabla mejorada
    doc.setFillColor(200, 200, 200)
    doc.rect(20, yPosition - 5, 170, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN DEL CREADOR', 25, yPosition + 2)
    yPosition += 12

    if (workOrder.createdBy) {
      const creatorData = [
        ['Creado por:', `${workOrder.createdBy.firstName} ${workOrder.createdBy.lastName}`],
        ['Email:', workOrder.createdBy.email],
        ['Fecha:', new Date(workOrder.createdAt).toLocaleDateString('es-CL')],
        ['Hora:', new Date(workOrder.createdAt).toLocaleTimeString('es-CL')]
      ]

      creatorData.forEach((row, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245)
          doc.rect(20, yPosition - 3, 170, 8, 'F')
        }
        
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(row[0] || '', 25, yPosition)
        doc.setFont('helvetica', 'bold')
        doc.text(row[1] || 'N/A', 80, yPosition)
        
        doc.setDrawColor(180, 180, 180)
        doc.setLineWidth(0.5)
        doc.line(20, yPosition + 3, 190, yPosition + 3)
        
        yPosition += 8
      })
    } else {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Información del creador no disponible', 25, yPosition)
      yPosition += 6
    }
    
    // Cerrar tabla del creador
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition - 8, 170, yPosition - 50 + 8)
    
    yPosition += 15

    // Verificar si necesitamos cambiar de página para la descripción
    if (yPosition > pageHeight - 100) {
      // Agregar nueva página
      doc.addPage()
      yPosition = 20
      
      // Header de la segunda página
      doc.setFillColor(primaryColor)
      doc.rect(0, 0, 210, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN ADICIONAL', 20, 15)
      
      // Línea decorativa
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.line(20, 18, 190, 18)
      
      yPosition = 35
    }

    // Sección de descripción del trabajo con tabla mejorada
    doc.setFillColor(200, 200, 200)
    doc.rect(20, yPosition - 5, 170, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DESCRIPCIÓN DEL TRABAJO', 25, yPosition + 2)
    yPosition += 12

    // Descripción del trabajo
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // Dividir descripción en múltiples líneas
    const description = workOrder.description
    const maxWidth = 160
    const lines = doc.splitTextToSize(description, maxWidth)
    doc.text(lines, 25, yPosition, { align: 'justify' })
    yPosition += lines.length * 4 + 10

    // Cerrar tabla de descripción
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition - 8, 170, yPosition - 50 + 8)
    
    yPosition += 15

    // Sección de observaciones (si existen) con tabla mejorada
    if (workOrder.observations) {
      // Verificar si necesitamos cambiar de página para las observaciones
      if (yPosition > pageHeight - 80) {
        // Agregar nueva página
        doc.addPage()
        yPosition = 20
        
        // Header de la segunda página
        doc.setFillColor(primaryColor)
        doc.rect(0, 0, 210, 25, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('INFORMACIÓN ADICIONAL', 20, 15)
        
        // Línea decorativa
        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(1)
        doc.line(20, 18, 190, 18)
        
        yPosition = 35
      }

      doc.setFillColor(200, 200, 200)
      doc.rect(20, yPosition - 5, 170, 10, 'F')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('OBSERVACIONES', 25, yPosition + 2)
      yPosition += 12

      // Observaciones
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      
      // Dividir observaciones en múltiples líneas
      const observations = workOrder.observations
      const obsLines = doc.splitTextToSize(observations, maxWidth)
      doc.text(obsLines, 25, yPosition, { align: 'justify' })
      yPosition += obsLines.length * 4 + 10

      // Cerrar tabla de observaciones
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.rect(20, yPosition - 8, 170, yPosition - 50 + 8)
      
      yPosition += 15
    }

    // Verificar si necesitamos cambiar de página para el progreso
    if (yPosition > pageHeight - 60) {
      // Agregar nueva página
      doc.addPage()
      yPosition = 20
      
      // Header de la segunda página
      doc.setFillColor(primaryColor)
      doc.rect(0, 0, 210, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN ADICIONAL', 20, 15)
      
      // Línea decorativa
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.line(20, 18, 190, 18)
      
      yPosition = 35
    }

    // Sección de progreso con tabla mejorada
    doc.setFillColor(200, 200, 200)
    doc.rect(20, yPosition - 5, 170, 10, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('PROGRESO DEL TRABAJO', 25, yPosition + 2)
    yPosition += 12

    // Calcular progreso basado en estado
    const getProgressFromStatus = (status: string): number => {
      switch (status) {
        case 'pendiente': return 0
        case 'en_progreso': return 50
        case 'pausado': return 25
        case 'completado': return 100
        case 'cancelado': return 0
        default: return 0
      }
    }

    const progress = getProgressFromStatus(workOrder.currentStatus)
    
    // Barra de progreso
    doc.setDrawColor(200, 200, 200)
    doc.rect(25, yPosition - 2, 100, 6)
    
    // Rellenar según progreso
    doc.setFillColor(getStatusColor(workOrder.currentStatus))
    doc.rect(25, yPosition - 2, (100 * progress) / 100, 6, 'F')
    
    // Texto de progreso
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`${progress}%`, 130, yPosition + 1)
    
    yPosition += 10

    // Cerrar tabla de progreso
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition - 8, 170, yPosition - 50 + 8)
    
    yPosition += 15

    // Verificar si necesitamos una segunda página para el footer
    const currentPageHeight = doc.internal.pageSize.height
    const currentY = yPosition
    
    if (currentY > currentPageHeight - 50) {
      // Agregar nueva página
      doc.addPage()
      yPosition = 20
      
      // Header de la segunda página
      doc.setFillColor(primaryColor)
      doc.rect(0, 0, 210, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN ADICIONAL', 20, 15)
      
      // Línea decorativa
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.line(20, 18, 190, 18)
      
      yPosition = 35
    }
    
    // Footer con información de generación mejorado
    const finalPageHeight = doc.internal.pageSize.height
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(1)
    doc.line(20, finalPageHeight - 30, 190, finalPageHeight - 30)
    
    // Información del footer
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`, 20, finalPageHeight - 20)
    doc.text('Sistema de Gestión de Taller - PepsiCo Fleet', 20, finalPageHeight - 15)
    doc.text('Documento generado automáticamente', 20, finalPageHeight - 10)


    // Guardar el PDF
    const fileName = `Orden_${workOrder.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  /**
   * Genera un PDF de múltiples órdenes (reporte)
   */
  static generateMultipleOrdersPDF(workOrders: WorkOrder[], title: string = 'Reporte de Órdenes de Trabajo'): void {
    const doc = new jsPDF()
    
    // Header
    doc.setFillColor('#1e40af')
    doc.rect(0, 0, 210, 30, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('PepsiCo Fleet', 20, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(title, 20, 25)

    let yPosition = 50
    
    // Título del reporte
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 20, yPosition)
    yPosition += 15

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total de órdenes: ${workOrders.length}`, 20, yPosition)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, 20, yPosition + 5)
    yPosition += 20

    // Tabla de órdenes
    workOrders.forEach((order, index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      // Fila de orden
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`${order.orderNumber}`, 20, yPosition)
      
      doc.setFont('helvetica', 'normal')
      doc.text(`${order.vehicle?.licensePlate || 'N/A'}`, 60, yPosition)
      doc.text(`${order.workType}`, 100, yPosition)
      doc.text(`${order.currentStatus}`, 140, yPosition)
      doc.text(`${order.priority}`, 170, yPosition)
      
      yPosition += 8
      
      // Descripción (truncada)
      const description = order.description.length > 50 
        ? order.description.substring(0, 50) + '...' 
        : order.description
      doc.text(description, 20, yPosition)
      
      yPosition += 15
    })

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor('#6b7280')
    doc.text(`Reporte generado el ${new Date().toLocaleDateString('es-CL')}`, 20, pageHeight - 20)
    doc.text('Sistema de Gestión de Taller - PepsiCo Fleet', 20, pageHeight - 15)

    // Guardar el PDF
    const fileName = `Reporte_Ordenes_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }
}

export const pdfService = new PDFService()

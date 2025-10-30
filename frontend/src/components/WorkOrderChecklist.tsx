import { useState, useEffect } from 'react'

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface WorkOrderChecklistProps {
  description: string
  onChecklistChange: (items: ChecklistItem[], allCompleted: boolean) => void
  initialItems?: ChecklistItem[]
  disabled?: boolean
}

export function WorkOrderChecklist({ 
  description, 
  onChecklistChange, 
  initialItems = [],
  disabled = false 
}: WorkOrderChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Parsear la descripción en tareas individuales solo una vez
  useEffect(() => {
    if (!hasInitialized && initialItems.length === 0 && description) {
      const parsedItems = parseDescriptionToTasks(description)
      setItems(parsedItems)
      setHasInitialized(true)
    }
  }, [description, initialItems.length, hasInitialized])

  // Notificar cambios al componente padre
  useEffect(() => {
    const allCompleted = items.length > 0 && items.every(item => item.completed)
    onChecklistChange(items, allCompleted)
  }, [items, onChecklistChange])

  const parseDescriptionToTasks = (desc: string): ChecklistItem[] => {
    // Dividir por comas, puntos y comas, o "y"
    const separators = /[,;]|\s+y\s+/i
    const tasks = desc.split(separators)
      .map(task => task.trim())
      .filter(task => task.length > 0)
      .map(task => {
        // Limpiar texto y capitalizar
        const cleanTask = task.replace(/^[-•]\s*/, '').trim()
        return cleanTask.charAt(0).toUpperCase() + cleanTask.slice(1)
      })

    return tasks.map((task, index) => ({
      id: `task-${index}`,
      text: task,
      completed: false
    }))
  }

  const toggleTask = (taskId: string) => {
    if (disabled) return
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600 italic">No hay tareas definidas para esta orden</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de progreso */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Progreso del Trabajo</h4>
          <span className="text-sm text-gray-600">
            {completedCount}/{totalCount} tareas completadas
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progressPercentage === 100 
            ? '✅ Todas las tareas completadas - Puede finalizar la orden'
            : `${Math.round(progressPercentage)}% completado`
          }
        </p>
      </div>

      {/* Lista de tareas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Tareas del Trabajo</h4>
        </div>
        <div className="p-4 space-y-3">
          {items.map((item) => (
            <label
              key={item.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                item.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleTask(item.id)}
                disabled={disabled}
                className={`mt-1 h-4 w-4 rounded border-2 transition-colors ${
                  item.completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-blue-600'
                } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              />
              <span
                className={`text-sm flex-1 ${
                  item.completed
                    ? 'text-green-800 line-through'
                    : 'text-gray-900'
                }`}
              >
                {item.text}
              </span>
              {item.completed && (
                <span className="text-green-600 text-sm">✅</span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}


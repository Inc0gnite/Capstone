import { useState, useRef, useEffect } from 'react'

interface RUTFieldProps {
  value: string
  onChange: (rut: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export function RUTField({ 
  value, 
  onChange, 
  className = "",
  placeholder = "12.345.678-9",
  disabled = false,
  required = false
}: RUTFieldProps) {
  const [part1, setPart1] = useState('')
  const [part2, setPart2] = useState('')
  const [part3, setPart3] = useState('')
  const [part4, setPart4] = useState('')
  
  const input1Ref = useRef<HTMLInputElement>(null)
  const input2Ref = useRef<HTMLInputElement>(null)
  const input3Ref = useRef<HTMLInputElement>(null)
  const input4Ref = useRef<HTMLInputElement>(null)

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      const clean = value.replace(/\./g, '').replace(/-/g, '')
      if (clean.length >= 8) {
        setPart1(clean.slice(0, 2))
        setPart2(clean.slice(2, 5))
        setPart3(clean.slice(5, 8))
        setPart4(clean.slice(8, 9))
      }
    } else {
      setPart1('')
      setPart2('')
      setPart3('')
      setPart4('')
    }
  }, [value])

  // Actualizar el valor completo cuando cambian las partes
  useEffect(() => {
    const fullRUT = `${part1}${part2}${part3}${part4}`
    if (fullRUT.length === 9) {
      const formatted = `${part1}.${part2}.${part3}-${part4}`
      // Solo actualizar si es diferente al valor actual para evitar loops
      const currentClean = value.replace(/\./g, '').replace(/-/g, '')
      if (fullRUT !== currentClean) {
        onChange(formatted)
      }
    } else if (fullRUT.length === 0 && value && value.trim() !== '') {
      onChange('')
    }
  }, [part1, part2, part3, part4])

  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
    setPart1(val)
    if (val.length === 2) {
      input2Ref.current?.focus()
    }
  }

  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3)
    setPart2(val)
    if (val.length === 3) {
      input3Ref.current?.focus()
    } else if (val.length === 0 && e.target.value === '') {
      input1Ref.current?.focus()
    }
  }

  const handlePart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3)
    setPart3(val)
    if (val.length === 3) {
      input4Ref.current?.focus()
    } else if (val.length === 0 && e.target.value === '') {
      input2Ref.current?.focus()
    }
  }

  const handlePart4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9kK]/g, '').slice(0, 1).toUpperCase()
    setPart4(val)
    if (val.length === 0 && e.target.value === '') {
      input3Ref.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentPart: number) => {
    if (e.key === 'Backspace') {
      const parts = [part1, part2, part3, part4]
      if (parts[currentPart - 1].length === 0 && currentPart > 0) {
        e.preventDefault()
        const prevInput = [input1Ref, input2Ref, input3Ref, input4Ref][currentPart - 2]
        prevInput.current?.focus()
      }
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        ref={input1Ref}
        type="text"
        value={part1}
        onChange={handlePart1Change}
        onKeyDown={(e) => handleKeyDown(e, 1)}
        maxLength={2}
        placeholder="12"
        disabled={disabled}
        required={required}
        className="w-12 px-2 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
      />
      <span className="text-gray-400">.</span>
      <input
        ref={input2Ref}
        type="text"
        value={part2}
        onChange={handlePart2Change}
        onKeyDown={(e) => handleKeyDown(e, 2)}
        maxLength={3}
        placeholder="345"
        disabled={disabled}
        className="w-14 px-2 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
      />
      <span className="text-gray-400">.</span>
      <input
        ref={input3Ref}
        type="text"
        value={part3}
        onChange={handlePart3Change}
        onKeyDown={(e) => handleKeyDown(e, 3)}
        maxLength={3}
        placeholder="678"
        disabled={disabled}
        className="w-14 px-2 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
      />
      <span className="text-gray-400">-</span>
      <input
        ref={input4Ref}
        type="text"
        value={part4}
        onChange={handlePart4Change}
        onKeyDown={(e) => handleKeyDown(e, 4)}
        maxLength={1}
        placeholder="9"
        disabled={disabled}
        className="w-10 px-2 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
      />
    </div>
  )
}


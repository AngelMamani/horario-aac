import { Sparkles } from 'lucide-react'
import type { Course } from '../../../shared/types/admin.types'

interface CourseFormProps {
  name: string
  onNameChange: (val: string) => void
  level: Course['level']
  onLevelChange: (val: Course['level']) => void
  selectedColor: string
  onPickColor: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function CourseForm({
  name,
  onNameChange,
  level,
  onLevelChange,
  selectedColor,
  onPickColor,
  onSubmit,
}: CourseFormProps) {
  return (
    <form className="admin-form" onSubmit={(e) => void onSubmit(e)} style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 200px 100px auto', 
      gap: '1rem', 
      alignItems: 'end' 
    }}>
      <div>
        <label className="modal-label">Nombre</label>
        <input 
          type="text" 
          placeholder="EJ. COMUNICACIÓN" 
          value={name} 
          onChange={(e) => onNameChange(e.target.value.toUpperCase())} 
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
        />
      </div>
      <div>
        <label className="modal-label">Nivel</label>
        <select 
          value={level} 
          onChange={(e) => onLevelChange(e.target.value as any)}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="Inicial">Inicial</option>
          <option value="Primaria">Primaria</option>
          <option value="Secundaria">Secundaria</option>
        </select>
      </div>
      <div>
        <label className="modal-label">Color</label>
        <div 
          onClick={onPickColor}
          style={{ 
            width: '100%', 
            height: '42px', 
            background: selectedColor, 
            borderRadius: '8px', 
            cursor: 'pointer', 
            border: '1px solid #ddd', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          title="Click para cambiar aleatoriamente"
        >
          <Sparkles size={16} color="#fff" />
        </div>
      </div>
      <button type="submit" className="btn btn--primary" style={{ padding: '0.8rem 1.5rem', fontWeight: 'bold' }}>Añadir</button>
    </form>
  )
}

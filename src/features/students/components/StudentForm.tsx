import type { Grade } from '../../../shared/types/admin.types'

interface StudentFormProps {
  fullName: string
  onNameChange: (val: string) => void
  gradeId: string
  onGradeChange: (val: string) => void
  grades: Grade[]
  status: string
  onStatusChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function StudentForm({
  fullName,
  onNameChange,
  gradeId,
  onGradeChange,
  grades,
  status,
  onStatusChange,
  onSubmit,
}: StudentFormProps) {
  return (
    <form className="admin-form" onSubmit={(e) => void onSubmit(e)}>
      <div style={{ gridColumn: 'span 2' }}>
        <label className="modal-label">Nombre Completo</label>
        <input 
          type="text" 
          value={fullName} 
          onChange={e => onNameChange(e.target.value.toUpperCase())} 
          placeholder="APELLIDOS Y NOMBRES"
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
        />
      </div>
      <div>
        <label className="modal-label">Grado</label>
        <select 
          value={gradeId} 
          onChange={e => onGradeChange(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
        >
          <option value="">Seleccionar grado</option>
          {grades.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="modal-label">Condición</label>
        <select 
          value={status} 
          onChange={e => onStatusChange(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
        >
          <option value="Regular">Regular</option>
          <option value="Beca">Beca</option>
          <option value="Traslado">Traslado</option>
        </select>
      </div>
      <button type="submit" className="btn btn--primary" style={{ marginTop: 'auto', padding: '0.8rem', fontWeight: 'bold' }}>
        Registrar
      </button>
    </form>
  )
}

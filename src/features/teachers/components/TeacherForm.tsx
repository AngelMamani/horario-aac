interface TeacherFormProps {
  fullName: string
  onNameChange: (val: string) => void
  position: string
  onPositionChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function TeacherForm({
  fullName,
  onNameChange,
  position,
  onPositionChange,
  onSubmit,
}: TeacherFormProps) {
  return (
    <form className="admin-form" onSubmit={(e) => void onSubmit(e)} style={{ gap: '1rem' }}>
      <div style={{ gridColumn: 'span 2' }}>
        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Nombres y Apellidos</label>
        <input
          type="text"
          placeholder="DOCENTE COMPLETO"
          value={fullName}
          onChange={(e) => onNameChange(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Cargo (ID del Docente)</label>
        <input
          type="text"
          placeholder="e.j. 1 DE PRIMARIA, COMPUTACION, etc."
          value={position}
          onChange={(e) => onPositionChange(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
        />
      </div>
      <button type="submit" className="btn btn--primary" style={{ gridColumn: 'span 4', padding: '0.8rem', fontWeight: 'bold' }}>
        Registrar Docente
      </button>
    </form>
  )
}

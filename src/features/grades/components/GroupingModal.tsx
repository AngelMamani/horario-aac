import { Layers } from 'lucide-react'
import type { Grade } from '../../../shared/types/admin.types'

interface GroupingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedGroupTarget: string
  setSelectedGroupTarget: (val: string) => void
  secondaryGroupList: string[]
  memoizedGradesByLevel: Record<string, Grade[]>
  modalAssignments: Record<string, string | undefined>
  onToggleGrade: (id: string, checked: boolean) => void
  onSave: () => Promise<void>
}

export function GroupingModal({
  isOpen,
  onClose,
  selectedGroupTarget,
  setSelectedGroupTarget,
  secondaryGroupList,
  memoizedGradesByLevel,
  modalAssignments,
  onToggleGrade,
  onSave,
}: GroupingModalProps) {
  if (!isOpen) return null

  return (
    <div className="grouping-modal-overlay">
      <div className="grouping-modal" style={{ maxWidth: '450px', padding: '1.5rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <Layers size={22} color="var(--color-primary-800)" />
          <h3 style={{ margin: 0 }}>Vincular Grados</h3>
        </div>
        
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>ELEGIR GRUPO:</label>
        <select 
            value={selectedGroupTarget} 
            onChange={e => setSelectedGroupTarget(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', margin: '0.6rem 0 1.2rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
        >
          {secondaryGroupList.map(name => <option key={name} value={name}>{name}</option>)}
        </select>

        <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '12px', maxHeight: '240px', overflowY: 'auto', border: '1px solid #f1f5f9' }}>
           {memoizedGradesByLevel.Secundaria.map(g => (
             <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                <input 
                    type="checkbox" 
                    checked={modalAssignments[g.id] === selectedGroupTarget}
                    disabled={modalAssignments[g.id] !== undefined && modalAssignments[g.id] !== selectedGroupTarget}
                    onChange={e => onToggleGrade(g.id, e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                />
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: modalAssignments[g.id] !== undefined && modalAssignments[g.id] !== selectedGroupTarget ? '#94a3af' : 'inherit' }}>{g.name}</span>
                    {modalAssignments[g.id] !== undefined && modalAssignments[g.id] !== selectedGroupTarget && (
                        <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>Ocupado por {modalAssignments[g.id]}</div>
                    )}
                </div>
             </label>
           ))}
        </div>

        <div className="grouping-modal__actions" style={{ marginTop: '1.8rem', gap: '1rem' }}>
          <button className="btn" onClick={onClose} style={{ flex: 1, padding: '0.8rem' }}>Cancelar</button>
          <button className="btn btn--primary" onClick={() => void onSave()} style={{ flex: 1, padding: '0.8rem', fontWeight: 'bold' }}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

import { LayoutGrid } from 'lucide-react'

interface ManageGroupModalProps {
  isOpen: boolean
  onClose: () => void
  managingGroup: string
  onDeleteGroup: (group: string) => Promise<void>
}

export function ManageGroupModal({
  isOpen,
  onClose,
  managingGroup,
  onDeleteGroup,
}: ManageGroupModalProps) {
  if (!isOpen) return null

  return (
    <div className="grouping-modal-overlay">
      <div className="grouping-modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem', borderRadius: '24px' }}>
        <div style={{ background: '#f8fafc', width: '70px', height: '70px', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1.2rem' }}>
            <LayoutGrid size={32} color="var(--color-primary-800)" />
        </div>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-primary-900)' }}>Gestionar {managingGroup}</h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2.2rem' }}>¿Qué acción deseas realizar con este grupo institucional?</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button className="btn btn--danger" onClick={() => void onDeleteGroup(managingGroup)} style={{ padding: '0.9rem', fontWeight: 'bold' }}>
                ELIMINAR GRUPO
            </button>
            <button className="btn" onClick={onClose} style={{ padding: '0.9rem' }}>
                SALIR
            </button>
        </div>
      </div>
    </div>
  )
}

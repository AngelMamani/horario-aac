interface InstitutionFormProps {
  settings: any
  onUpdate: (data: any) => void
}

export function InstitutionForm({ settings, onUpdate }: InstitutionFormProps) {
  return (
    <form className="admin-form" style={{ padding: '0 1rem 1rem' }}>
      <div style={{ gridColumn: 'span 3' }}>
        <label className="modal-label">Nombre de la Institución</label>
        <input
          type="text"
          value={settings.institutionName || ''}
          onChange={(event) =>
            onUpdate({ institutionName: event.target.value.toUpperCase() })
          }
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <label className="modal-label">Director(a)</label>
        <input
          type="text"
          value={settings.principal || ''}
          onChange={(event) =>
            onUpdate({ principal: event.target.value.toUpperCase() })
          }
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ gridColumn: 'span 3' }}>
        <label className="modal-label">Dirección / Ubicación</label>
        <input
          type="text"
          value={settings.address || ''}
          onChange={(event) =>
            onUpdate({ address: event.target.value.toUpperCase() })
          }
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <label className="modal-label">Teléfono de Contacto</label>
        <input
          type="text"
          value={settings.phone || ''}
          onChange={(event) =>
            onUpdate({ phone: event.target.value })
          }
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
        />
      </div>
    </form>
  )
}

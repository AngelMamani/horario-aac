import { useFirestoreDocState } from '../../../shared/hooks/useFirestoreDocState'

export function SettingsPage() {
  const [settings, setSettings] = useFirestoreDocState(
    'settings',
    'aac-settings',
    {
      institutionName: 'I.E.P. ANDRÉS AVELINO CÁCERES',
      address: 'Jr. Ica 456, Puerto Maldonado',
      phone: '082-571234',
      principal: 'Mg. Luis Alberto Rodriguez',
      principalColor: '#0e4a7f',
      bimestreActual: 'I Bimestre'
    },
    { localStorageKey: 'aac-settings' },
  )

  return (
    <section className="animate-in">
      <header className="page-header">
        <div className="header-badge">CONFIGURACIÓN DEL SISTEMA</div>
        <h2>Ajustes Globales</h2>
        <p>Configuración administrativa, académica y de apariencia institucional.</p>
      </header>

      <div className="dashboard-structured-layout">
        <div className="dashboard-content-main">
          {/* Datos Institucionales */}
          <section className="panel-card form-card panel-section">
            <div className="panel-card__header">
              <h3>Datos Institucionales</h3>
              <span>Información básica para documentos oficiales</span>
            </div>
            <form className="admin-form" style={{ padding: '0 1rem 1rem' }}>
              <div style={{ gridColumn: 'span 3' }}>
                <label className="modal-label">Nombre de la Institución</label>
                <input
                  type="text"
                  value={settings.institutionName || ''}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, institutionName: event.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="modal-label">Director(a)</label>
                <input
                  type="text"
                  value={settings.principal || ''}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, principal: event.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <label className="modal-label">Dirección / Ubicación</label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, address: event.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="modal-label">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
            </form>
          </section>

          {/* Configuración Académica */}
          <section className="panel-card form-card panel-section">
            <div className="panel-card__header">
              <h3>Configuración Académica</h3>
              <span>Gestión de periodos y escalas de evaluación</span>
            </div>
            <div className="admin-form" style={{ padding: '0 1rem 1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="modal-label">Bimestre Actual</label>
                <select 
                  value={settings.bimestreActual}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, bimestreActual: event.target.value }))
                  }
                >
                  <option value="I Bimestre">I Bimestre</option>
                  <option value="II Bimestre">II Bimestre</option>
                  <option value="III Bimestre">III Bimestre</option>
                  <option value="IV Bimestre">IV Bimestre</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                 <label className="modal-label">Escala de Calificación</label>
                 <div style={{ display: 'flex', gap: '0.8rem', paddingTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                       <input type="radio" checked readOnly /> NUMÉRICA (0 - 20)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                       <input type="radio" disabled /> Literal (AD, A, B, C)
                    </label>
                 </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="dashboard-content-aside">
           <div className="panel-card">
              <div className="panel-card__header">
                 <h3>Personalización</h3>
                 <span>Color base y logotipo</span>
              </div>
              <div style={{ padding: '1rem' }}>
                 <label className="modal-label">Color institucional (Navbar/Botones)</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <input
                      type="color"
                      value={settings.principalColor || '#0e4a7f'}
                      onChange={(event) =>
                        setSettings((prev) => ({ ...prev, principalColor: event.target.value }))
                      }
                      style={{ width: '40px', height: '40px', border: 'none', background: 'transparent' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'monospace' }}>{settings.principalColor || '#0e4a7f'}</span>
                 </div>
                 
                 <div style={{ marginTop: '2rem' }}>
                    <label className="modal-label">Logotipo Oficial</label>
                    <div style={{ border: '2px dashed #c8dce9', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', marginTop: '0.5rem' }}>
                       <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                       <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0' }}>Click para subir imagen</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="alert-card" style={{ marginTop: '1.5rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                 <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                 <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#92400e' }}>Aviso importante</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#b45309' }}>Cualquier cambio en los datos oficiales afectará directamente a las boletas de notas y certificados.</p>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </section>
  )
}

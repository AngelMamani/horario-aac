import { useFirestoreDocState } from '../../../shared/hooks/useFirestoreDocState'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PanelCard } from '../../../shared/components/PanelCard'
import { InstitutionForm } from '../components/InstitutionForm'
import { Settings } from 'lucide-react'

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

  const handleUpdate = (updatedFields: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updatedFields }))
  }

  return (
    <section>
      <PageHeader 
        title="Ajustes Globales" 
        subtitle="Configuración administrativa, académica y de apariencia institucional."
        icon={Settings}
      />

      <div className="dashboard-structured-layout">
        <div className="dashboard-content-main" style={{ display: 'grid', gap: '1.5rem' }}>
          <PanelCard 
            title="Datos Institucionales" 
            headerActions={<span>Información básica para documentos oficiales</span>}
          >
            <InstitutionForm 
              settings={settings}
              onUpdate={handleUpdate}
            />
          </PanelCard>

          <PanelCard 
            title="Configuración Académica" 
            headerActions={<span>Gestión de periodos y escalas de evaluación</span>}
          >
            <div className="admin-form">
              <div style={{ gridColumn: 'span 2' }}>
                <label className="modal-label">Bimestre Actual</label>
                <select 
                  value={settings.bimestreActual}
                  onChange={(event) => handleUpdate({ bimestreActual: event.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }}
                >
                  <option value="I Bimestre">I Bimestre</option>
                  <option value="II Bimestre">II Bimestre</option>
                  <option value="III Bimestre">III Bimestre</option>
                  <option value="IV Bimestre">IV Bimestre</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                  <label className="modal-label">Escala de Calificación</label>
                  <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', cursor: 'pointer' }}>
                        <input type="radio" checked readOnly style={{ width: '18px', height: '18px' }} /> 
                        <strong>NUMÉRICA (0 - 20)</strong>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', opacity: 0.5, cursor: 'not-allowed' }}>
                        <input type="radio" disabled style={{ width: '18px', height: '18px' }} /> 
                        Literal (AD, A, B, C)
                    </label>
                  </div>
              </div>
            </div>
          </PanelCard>
        </div>

        <aside className="dashboard-content-aside">
           <PanelCard 
             title="Personalización" 
             headerActions={<span>Color base y logotipo</span>}
           >
              <label className="modal-label">Color institucional (Navbar/Botones)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input
                  type="color"
                  value={settings.principalColor || '#0e4a7f'}
                  onChange={(event) => handleUpdate({ principalColor: event.target.value })}
                  style={{ width: '48px', height: '48px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1rem', color: '#0e4a7f', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {settings.principalColor || '#0e4a7f'}
                </span>
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <label className="modal-label">Logotipo Oficial</label>
                <div style={{ 
                  border: '2px dashed #c8dce9', 
                  borderRadius: '16px', 
                  padding: '2rem', 
                  textAlign: 'center', 
                  marginTop: '0.5rem',
                  background: '#f8fafc'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Click para subir imagen</p>
                </div>
              </div>
           </PanelCard>

           <div className="alert-card" style={{ 
              marginTop: '1.5rem', 
              background: '#fffbeb', 
              border: '1px solid #fde68a', 
              borderRadius: '16px', 
              padding: '1.2rem' 
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                 <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#92400e' }}>Aviso importante</p>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#b45309', lineHeight: '1.4' }}>
                      Cualquier cambio en los datos oficiales afectará directamente a las boletas de notas y certificados generados por el sistema.
                    </p>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </section>
  )
}

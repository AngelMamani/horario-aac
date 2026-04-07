import { HelpCircle, Library, Sparkles, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Grade } from '../../../shared/types/admin.types'

interface GradesTableProps {
  activeTab: string
  currentGrades: Grade[]
  onAutoGenerate: () => Promise<void>
  onDelete: (id: string, name: string) => Promise<void>
}

export function GradesTable({
  activeTab,
  currentGrades,
  onAutoGenerate,
  onDelete,
}: GradesTableProps) {
  return (
    <div className="panel-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div className="panel-card__header" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Grados de {activeTab}</h3>
        {currentGrades.length === 0 && (
          <button className="btn btn--primary btn--small" onClick={() => void onAutoGenerate()}>
            <Sparkles size={14} style={{ marginRight: '5px' }} /> Generar Oficiales
          </button>
        )}
      </div>
      
      <div className="table-wrapper">
         <table>
           <thead>
             <tr>
               <th>Grado</th>
               {activeTab === 'Secundaria' && <th>Grupo</th>}
               <th>Estado</th>
               <th style={{ textAlign: 'center' }}>Acción</th>
             </tr>
           </thead>
           <tbody>
             {currentGrades.length === 0 ? (
               <tr>
                 <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                     <HelpCircle size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} /><br/>
                     No hay grados en este nivel.
                 </td>
               </tr>
             ) : (
               currentGrades.map(g => (
                 <tr key={g.id}>
                   <td><strong style={{ fontSize: '0.9rem' }}>{g.name}</strong></td>
                   {activeTab === 'Secundaria' && (
                     <td><span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', color: g.secondaryGroup ? '#0f172a' : '#94a3af', fontWeight: '600' }}>{g.secondaryGroup || 'Sin Grupo'}</span></td>
                   )}
                   <td>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontWeight: 'bold' }}>ACTIVO</span>
                   </td>
                   <td>
                     <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Link to="/malla-curricular" className="btn btn--small btn--primary" title="Ver Malla Curricular" style={{ padding: '0.4rem 0.8rem' }}>
                            <Library size={14}/>
                        </Link>
                        <button className="btn btn--small btn--danger" style={{ padding: '0.4rem 0.8rem' }} onClick={() => void onDelete(g.id, g.name)} title="Eliminar Grado">
                            <Trash2 size={14}/>
                        </button>
                     </div>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
      </div>
    </div>
  )
}

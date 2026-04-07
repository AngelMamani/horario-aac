import Swal from 'sweetalert2'
import { useMemo, useState } from 'react'
import type { Grade } from '../../../shared/types/admin.types'
import { useGrades } from '../hooks/useGrades'
import { useGradesConfig } from '../hooks/useGradesConfig'
import { PlusCircle, Users, Layers, LayoutGrid } from 'lucide-react'
import { GroupingModal } from '../components/GroupingModal'
import { ManageGroupModal } from '../components/ManageGroupModal'
import { GradesTable } from '../components/GradesTable'

function showToast(
  icon: 'success' | 'error' | 'warning' | 'info',
  title: string,
  timer = 1800,
) {
  void Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer,
  })
}

const MAX_SECONDARY_GROUP_NUMBER = 5

const gradeCatalog: Record<string, string[]> = {
  Inicial: ['3 años', '4 años', '5 años'],
  Primaria: [
    '1ro Primaria', '2do Primaria', '3ro Primaria', '4to Primaria', '5to Primaria', '6to Primaria'
  ],
  Secundaria: [
    '1ro Secundaria', '2do Secundaria', '3ro Secundaria', '4to Secundaria', '5to Secundaria'
  ],
}

const levelOrder: Grade['level'][] = ['Inicial', 'Primaria', 'Secundaria']

export function GradesPage() {
  const { grades, loading, deleteGrade, batchCreateGrades, batchUpdateSecondaryGroups } = useGrades()
  const { secondaryGroupNumbers, updateSecondaryGroupNumbers, loadingConfig } = useGradesConfig()

  const [newGroupNumber, setNewGroupNumber] = useState('')
  const [activeTab, setActiveTab] = useState<Grade['level']>('Primaria')
  
  const [isGroupingModalOpen, setIsGroupingModalOpen] = useState(false)
  const [selectedGroupTarget, setSelectedGroupTarget] = useState('')
  const [modalAssignments, setModalAssignments] = useState<Record<string, string | undefined>>({})
  
  const [isManageGroupModalOpen, setIsManageGroupModalOpen] = useState(false)
  const [managingGroup, setManagingGroup] = useState('')

  const secondaryGroupList = useMemo(
    () =>
      [...new Set(secondaryGroupNumbers)]
        .filter((v) => v > 0)
        .sort((a, b) => a - b)
        .map((v) => `Secundaria ${v}`),
    [secondaryGroupNumbers],
  )

  const memoizedGradesByLevel = useMemo(() => {
    const map: Record<string, Grade[]> = { Inicial: [], Primaria: [], Secundaria: [] }
    grades.forEach(g => { if (map[g.level]) map[g.level].push(g) })
    Object.keys(map).forEach(key => map[key].sort((a, b) => (a.name || '').localeCompare(b.name || '')))
    return map
  }, [grades])

  const secondaryGroupingData = useMemo(() => {
    const sec = grades.filter(g => g.level === 'Secundaria')
    return secondaryGroupList.map(name => ({
      name,
      count: sec.filter(g => g.secondaryGroup === name).length
    }))
  }, [grades, secondaryGroupList])

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar grado?',
      text: `Se eliminará permanentemente ${name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#c03d3d'
    })
    if (result.isConfirmed) {
      await deleteGrade(id)
      showToast('success', 'Grado eliminado')
    }
  }

  const handleAutoGenerate = async () => {
    const defaultSecMap: Record<string, string> = {
      '1ro Secundaria': 'Secundaria 1', '2do Secundaria': 'Secundaria 1',
      '3ro Secundaria': 'Secundaria 2', '4to Secundaria': 'Secundaria 2',
      '5to Secundaria': 'Secundaria 3'
    }
    const existing = new Set(grades.map(g => g.name.toLowerCase()))
    const missing: Grade[] = []
    
    levelOrder.forEach(lvl => {
      gradeCatalog[lvl].forEach(name => {
        if (!existing.has(name.toLowerCase())) {
          const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
          const g: Grade = { id, name, level: lvl, status: 'Activo', sectionCount: 1 }
          if (lvl === 'Secundaria') g.secondaryGroup = defaultSecMap[name]
          missing.push(g)
        }
      })
    })

    if (missing.length) {
      await batchCreateGrades(missing)
      showToast('success', 'Grados oficiales generados')
    } else {
      showToast('info', 'Todos los grados ya existen')
    }
  }

  const handleAddGroup = async () => {
    const val = parseInt(newGroupNumber)
    if (!val || val < 1 || val > MAX_SECONDARY_GROUP_NUMBER) {
        showToast('warning', 'Número de grupo no válido (1-' + MAX_SECONDARY_GROUP_NUMBER + ')');
        return;
    }
    if (secondaryGroupNumbers.includes(val)) {
        showToast('warning', 'El grupo ya existe');
        return;
    }
    await updateSecondaryGroupNumbers([...secondaryGroupNumbers, val])
    setNewGroupNumber('')
    showToast('success', 'Grupo añadido')
  }

  const openGroupingModal = () => {
    if (secondaryGroupList.length === 0) {
        showToast('warning', 'Primero añade al menos un grupo');
        return;
    }
    const initial: Record<string, string | undefined> = {}
    grades.filter(g => g.level === 'Secundaria').forEach(g => {
        initial[g.id] = g.secondaryGroup
    })
    setModalAssignments(initial)
    setSelectedGroupTarget(secondaryGroupList[0])
    setIsGroupingModalOpen(true)
  }

  const handleToggleModalGrade = (id: string, checked: boolean) => {
    setModalAssignments(prev => ({ ...prev, [id]: checked ? selectedGroupTarget : undefined }))
  }

  const handleSaveGrouping = async () => {
    const updates = Object.entries(modalAssignments).map(([id, group]) => ({ id, secondaryGroup: group || undefined }))
    await batchUpdateSecondaryGroups(updates)
    setIsGroupingModalOpen(false)
    showToast('success', 'Agrupación actualizada')
  }

  const handleDeleteGroupAction = async (group: string) => {
    const num = parseInt(group.replace('Secundaria ', ''))
    const result = await Swal.fire({
      title: '¿Eliminar Grupo?',
      text: `Los grados de ${group} quedarán sin grupo asignado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#c03d3d'
    })
    if (result.isConfirmed) {
      await updateSecondaryGroupNumbers(secondaryGroupNumbers.filter(n => n !== num))
      setIsManageGroupModalOpen(false)
      showToast('success', 'Grupo eliminado')
    }
  }

  if (loading || loadingConfig) {
    return <section className="page-header"><h2>Cargando Configuración...</h2></section>
  }

  const currentGrades = memoizedGradesByLevel[activeTab] || []

  return (
    <section>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Users size={24} color="var(--color-primary-800)" />
          <div>
            <h2>Configuración de Grados</h2>
            <p>Estructura los niveles educativos de la institución.</p>
          </div>
        </div>
      </header>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        {levelOrder.map(lvl => (
          <button
            key={lvl}
            onClick={() => setActiveTab(lvl)}
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === lvl ? 'var(--color-primary-800)' : '#f1f5f9',
              color: activeTab === lvl ? '#fff' : '#64748b',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s'
            }}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Secundaria Specific Controls inside main flow */}
        {activeTab === 'Secundaria' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div className="panel-card" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '5px solid var(--color-gold-500)' }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Vincular o Malla</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Organiza los grados por grupos.</p>
                    </div>
                    <button className="btn btn--primary" onClick={openGroupingModal} style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={16} /> Organizar
                    </button>
                </div>
                <div className="panel-card" style={{ padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#fdfcf7' }}>
                    <PlusCircle size={20} color="var(--color-primary-800)" />
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: '#64748b' }}>NUEVO GRUPO</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                            <input type="number" placeholder="Ej. 1" value={newGroupNumber} onChange={e => setNewGroupNumber(e.target.value)} style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <button className="btn btn--primary btn--small" onClick={() => void handleAddGroup()}>Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Groups Summary for Secundaria on Mobile / Desktop */}
        {activeTab === 'Secundaria' && secondaryGroupingData.length > 0 && (
             <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.8rem', paddingTop: '0.4rem' }}>
                {secondaryGroupingData.map(group => (
                    <div 
                        key={group.name} 
                        onClick={() => { setManagingGroup(group.name); setIsManageGroupModalOpen(true); }}
                        style={{ 
                            background: '#fff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '16px', 
                            padding: '1rem', 
                            minWidth: '180px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '4px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-900)' }}>{group.name}</strong>
                            <LayoutGrid size={14} color="#94a3af" />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>{group.count} grados vinc.</span>
                    </div>
                ))}
             </div>
        )}

        {/* Main Table Panel */}
        <GradesTable 
          activeTab={activeTab}
          currentGrades={currentGrades}
          onAutoGenerate={handleAutoGenerate}
          onDelete={handleDelete}
        />

      </div>

      <GroupingModal 
        isOpen={isGroupingModalOpen}
        onClose={() => setIsGroupingModalOpen(false)}
        selectedGroupTarget={selectedGroupTarget}
        setSelectedGroupTarget={setSelectedGroupTarget}
        secondaryGroupList={secondaryGroupList}
        memoizedGradesByLevel={memoizedGradesByLevel}
        modalAssignments={modalAssignments}
        onToggleGrade={handleToggleModalGrade}
        onSave={handleSaveGrouping}
      />

      <ManageGroupModal 
        isOpen={isManageGroupModalOpen}
        onClose={() => setIsManageGroupModalOpen(false)}
        managingGroup={managingGroup}
        onDeleteGroup={handleDeleteGroupAction}
      />
    </section>
  )
}

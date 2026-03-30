import type { ScheduleItem } from '../../../shared/types/admin.types'

type ScheduleTableProps = {
  items: ScheduleItem[]
}

export function ScheduleTable({ items }: ScheduleTableProps) {
  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <h3>Horarios del día</h3>
        <span>Turnos mañana y tarde</span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Grado / Sección</th>
              <th>Turno</th>
              <th>Tutor</th>
              <th>Aula</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.grade}</td>
                <td>{item.shift}</td>
                <td>{item.tutor}</td>
                <td>{item.classroom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface DistributionChartProps {
  distribution: Record<string, number>
  getPercentage: (count: number) => number
}

export function DistributionChart({ distribution, getPercentage }: DistributionChartProps) {
  return (
    <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
      {['Inicial', 'Primaria', 'Secundaria'].map((level) => {
        const count = distribution[level] || 0
        const pct = getPercentage(count)
        return (
          <div key={level} className="bar-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 600 }}>Nivel {level}</span>
              <span style={{ color: 'var(--color-primary-800)', fontWeight: 700 }}>{count} Alumnos ({pct.toFixed(1)}%)</span>
            </div>
            <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${pct}%`, 
                  height: '100%', 
                  background: level === 'Inicial' ? 'linear-gradient(90deg, #13639f, #4ade80)' : 
                              level === 'Primaria' ? 'linear-gradient(90deg, #0e4a7f, #13639f)' : 
                              'linear-gradient(90deg, #08365f, #0e4a7f)',
                  transition: 'width 1s ease-in-out'
                }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

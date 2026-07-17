export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px',
        flex: 1,
      }}
    >
      {/* TopBar skeleton */}
      <div
        style={{
          height: 64,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-default)',
          marginTop: -24,
          marginLeft: -24,
          marginRight: -24,
          marginBottom: 24,
        }}
      />
      {/* Stat cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 8 }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 104,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              animation: 'shimmer 1.5s ease infinite',
            }}
          />
        ))}
      </div>
      {/* Content skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div
          style={{
            height: 280,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            animation: 'shimmer 1.5s ease infinite 0.1s',
          }}
        />
        <div
          style={{
            height: 280,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            animation: 'shimmer 1.5s ease infinite 0.2s',
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

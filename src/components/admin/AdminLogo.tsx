import React from 'react'

export const AdminLogo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.png" alt="Байым" style={{ width: 220, height: 'auto' }} />
    <span style={{ fontSize: 13, opacity: 0.7, letterSpacing: '0.04em' }}>Панель управления сайтом</span>
  </div>
)

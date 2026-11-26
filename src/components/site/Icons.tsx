import React from 'react'

type P = { className?: string; size?: number }

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const ServiceIcon = ({ name, className, size = 40 }: P & { name?: string | null }) => {
  const p = { ...base(size), className }
  switch (name) {
    case 'crane':
      return (
        <svg {...p}>
          <path d="M6 21V4h1.5L19 7M6 7h13M9 21h-6M7.5 4 6 7M15 7v3m-1.5 0h3v2h-3z" />
          <path d="M3 21h18" />
        </svg>
      )
    case 'house':
      return (
        <svg {...p}>
          <path d="M3 11 12 4l9 7" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      )
    case 'docs':
      return (
        <svg {...p}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
          <path d="m9.5 9.5 1 1 2-2" />
        </svg>
      )
    case 'concrete':
      return (
        <svg {...p}>
          <path d="M3 20h18M5 20V9h14v11" />
          <path d="M5 13h14M9 9v11M15 9v11" />
          <path d="M8 6l4-3 4 3" />
        </svg>
      )
    case 'pipes':
      return (
        <svg {...p}>
          <path d="M3 7h7a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h5" />
          <path d="M3 11h5a1 1 0 0 1 1 1v2a7 7 0 0 0 7 7h5" />
          <circle cx="12.5" cy="4.5" r="1.5" />
        </svg>
      )
    default:
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <path d="M3 9h7v12M10 14h11M15 3v6h6" />
        </svg>
      )
  }
}

export const WhatsAppIcon = ({ size = 22, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43a9.4 9.4 0 0 1 9.43 9.44c0 5.2-4.24 9.42-9.44 9.42m8.02-17.45A11.27 11.27 0 0 0 12.05.75C5.8.75.7 5.84.7 12.1c0 2 .52 3.95 1.52 5.67L.6 23.65l6.01-1.58a11.3 11.3 0 0 0 5.43 1.38h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.03" />
  </svg>
)

export const PhoneIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
)

export const ArrowIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const SocialIcon = ({ network, size = 20 }: { network: string; size?: number }) => {
  const p = base(size)
  switch (network) {
    case 'instagram':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...p}>
          <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />
        </svg>
      )
    case 'telegram':
      return (
        <svg {...p}>
          <path d="m21 4-18 7 6 2 2 6 3-4 5 4z" />
          <path d="m9 13 8-6" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...p}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="m10 9.5 5 2.5-5 2.5z" />
        </svg>
      )
    default:
      return (
        <svg {...p}>
          <path d="M14 3v11a4 4 0 1 1-4-4" />
          <path d="M14 3a5 5 0 0 0 5 5" />
        </svg>
      )
  }
}

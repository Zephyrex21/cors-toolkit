/**
 * AllowOrigin — Logo Mark
 * Crisp inline SVG (matches public/favicon.svg) so it scales
 * perfectly at any size without rasterization artifacts.
 */
export default function LogoMark({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <rect x="5" y="12" width="10" height="8" rx="4" stroke="white" strokeWidth="2.5" fill="none" />
      <rect x="17" y="12" width="10" height="8" rx="4" stroke="white" strokeWidth="2.5" fill="none" />
      <line x1="14" y1="16" x2="18" y2="16" stroke="white" strokeWidth="2.5" />
    </svg>
  )
}

export function MicrosoftOutlookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      aria-hidden="true"
    >
      <rect width="256" height="256" rx="8" fill="#0078D4" />
      <path
        fill="#50D9FF"
        d="M138 48h82a8 8 0 0 1 8 8v66h-90V48z"
      />
      <path
        fill="#FFF"
        d="M138 122h90v66a8 8 0 0 1-8 8h-82v-74z"
      />
      <path
        fill="#28A8E0"
        d="M138 122h90V188a8 8 0 0 1-8 8h-82v-74z"
        opacity=".5"
      />
      <path
        fill="#0078D4"
        d="M138 48h82a8 8 0 0 1 8 8v66h-90V48z"
        opacity=".3"
      />
      <rect fill="#0078D4" x="28" y="56" width="120" height="144" rx="8" />
      <ellipse cx="88" cy="128" rx="32" ry="36" fill="#FFF" />
      <ellipse cx="88" cy="128" rx="20" ry="24" fill="#0078D4" />
    </svg>
  )
}

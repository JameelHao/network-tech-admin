export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label="NetTech Radar"
      className={className}
    >
      <rect width="32" height="32" rx="6" fill="#1B2A4A" />
      <text
        x="16"
        y="22.5"
        textAnchor="middle"
        fontFamily="ui-serif, 'Playfair Display', Georgia, serif"
        fontSize="16"
        fontWeight={700}
        fill="#C9A94E"
        letterSpacing="0.5"
      >
        NT
      </text>
    </svg>
  );
}

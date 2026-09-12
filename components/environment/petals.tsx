const PETALS = Array.from({ length: 18 }, (_, i) => {
  const seed = (i * 37) % 100
  return {
    left: `${(i * 5.5 + 2) % 100}%`,
    size: 6 + (seed % 8),
    duration: 12 + (seed % 10),
    delay: -(seed % 14),
    drift: `${((seed % 8) - 4) * 1.6}vw`,
  }
})

export function Petals() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal absolute top-0 rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 0.72,
            // @ts-expect-error custom property used by keyframes
            "--drift": p.drift,
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.9 0.06 350 / 0.95), oklch(0.78 0.09 350 / 0.4))",
            borderRadius: "60% 0 60% 0",
            filter: "blur(0.2px)",
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

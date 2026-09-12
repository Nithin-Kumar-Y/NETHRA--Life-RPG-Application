export function VillageBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="parallax-bg absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/environment/village-night.png')",
          animation: "drift-parallax 32s ease-in-out infinite",
        }}
      />
      {/* Depth + readability grading */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_40%,oklch(0.12_0.03_265/0.65)_100%)]" />
    </div>
  )
}

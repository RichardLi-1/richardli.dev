import type { ReactNode } from "react"

// The core equations behind Transit Planner, as implemented in the app.
// Shared by /transitplanner and its case study so the two pages can't drift.
// Paper-style layout: each equation is a centered display line; the rest is body text.
const MODELS: { name: string; formula: ReactNode; where: ReactNode; why?: ReactNode }[] = [
  {
    name: "Ridership (gravity model)",
    formula: <>B = P × max(0.1, 60 / h) × m / 365</>,
    where: <>where B is daily boardings at a stop, P the population within 800 m, h the headway in minutes, and m the mode factor (subway 1.5, LRT 1.2, streetcar 1.0, GO 0.6, bus 0.5).</>,
  },
  {
    name: "Capital cost",
    formula: <>C = L × r<sub>km</sub> + N × r<sub>stn</sub></>,
    where: <>where L is the line length in km, N the number of stations, and r<sub>km</sub>, r<sub>stn</sub> the per-km and per-station rates: subway $0.5B and $0.15B, LRT and streetcar $0.08B and $0.025B, bus $0.004B and $0.001B.</>,
    why: <>Evan chose to price stations separately because they drive a large share of real capital cost; per-km pricing alone rates a 6-stop and a 20-stop line of the same length identically.</>,
  },
  {
    name: "Transit desert severity",
    formula: <>S = ρ × (1 - A), A = min(1, f × w × c / (1 + d / 0.4))</>,
    where: <>where ρ is the log-normalized population density (0 to 1), d the distance to the nearest stop in km, f = min(1, 30 / h) the frequency score, w the mode weight (subway and LRT 1.0, GO and streetcar 0.9, bus 0.85), and c = min(1.5, 1 + 0.1(n - 1)) a bonus for the n routes within 800 m.</>,
    why: <>I chose a 30-minute headway baseline because a 10-minute one made regular bus service score almost as badly as no transit, so the layer just mirrored population density.</>,
  },
  {
    name: "Equity score (commuter simulation)",
    formula: <>E = 100 × Σ<sub>reached</sub> w<sub>i</sub> / Σ w<sub>i</sub></>,
    where: <>where w<sub>i</sub> is agent i&apos;s income weight (low 1.5, mid 1.0, high 0.5) times its transit dependence, and the numerator sums over agents with a workable transit commute.</>,
  },
  {
    name: "Coverage",
    formula: <>Coverage = P(d ≤ 0.8 km) / P<sub>total</sub></>,
    where: <>where P(d ≤ 0.8 km) is the census population within 800 m of any stop. A block more than 1 km from every stop counts as a service gap.</>,
  },
]

export function TransitPlannerModels() {
  return (
    <div className="space-y-6">
      {MODELS.map((model) => (
        <div key={model.name}>
          <p>{model.name}:</p>
          <div className="my-3 overflow-x-auto text-center text-lg" style={{ color: "var(--text)" }}>
            {model.formula}
          </div>
          <p className="italic">{model.where}</p>
          {model.why && <p className="mt-2">{model.why}</p>}
        </div>
      ))}
    </div>
  )
}

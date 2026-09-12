"use client"

import { useMemo, useState } from "react"
import { Package } from "lucide-react"
import { useGame } from "@/components/game-provider"
import { GOLD_SHOP, MINI_GAMES } from "@/lib/shop"

type GameId = "shogun-dice" | "memory-match" | "lantern-flash"

export default function InventoryPage() {
  const { state, dispatch, error, notice } = useGame()
  const [activeGame, setActiveGame] = useState<GameId | null>(null)

  return (
    <main className="mt-6 flex flex-1 flex-col gap-6">
      <section className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-primary" aria-hidden="true" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reward & rest</p>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-wide sm:text-4xl">Inventory</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A quiet room for trophies, gold crafts, and short rest games. No wagers. No real money.
        </p>
      </section>

      <section>
        <h2 className="mb-3 px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">Items</h2>
        {state.inventory.length === 0 ? (
          <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">Trophies and keepsakes appear as you complete the path.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {state.inventory.map((item) => (
              <li key={item.id} className="glass glass-hover rounded-2xl p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">{item.slot}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">{item.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">Gold shop</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GOLD_SHOP.map((item) => {
            const owned = state.inventory.some((ownedItem) => ownedItem.id === item.id)
            return (
              <li key={item.id} className="glass rounded-2xl p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{item.cost} Gold</p>
                <h3 className="font-display text-lg">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                <button
                  type="button"
                  disabled={owned}
                  onClick={() => dispatch({ type: "BUY_ITEM", shopId: item.id })}
                  className="press mt-3 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground"
                >
                  {owned ? "Owned" : "Acquire"}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">Rest / mini games</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {MINI_GAMES.map((game) => (
            <li key={game.id} className="glass rounded-2xl p-4">
              <h3 className="font-display text-lg">{game.name}</h3>
              <p className="text-sm text-muted-foreground">{game.blurb}</p>
              <p className="mt-2 text-xs text-gold">{game.cost} Gold</p>
              <button
                type="button"
                onClick={() => setActiveGame(game.id as GameId)}
                className="press mt-3 w-full rounded-xl bg-background/40 px-3 py-2 text-sm ring-1 ring-border"
              >
                Play
              </button>
            </li>
          ))}
        </ul>
        {activeGame ? (
          <div className="mt-4">
            {activeGame === "shogun-dice" ? <ShogunDice onClose={() => setActiveGame(null)} /> : null}
            {activeGame === "memory-match" ? <MemoryMatch onClose={() => setActiveGame(null)} /> : null}
            {activeGame === "lantern-flash" ? <LanternFlash onClose={() => setActiveGame(null)} /> : null}
          </div>
        ) : null}
      </section>

      {error || notice ? <p className="text-sm text-gold">{error || notice}</p> : null}
    </main>
  )
}

function ShogunDice({ onClose }: { onClose: () => void }) {
  const { dispatch } = useGame()
  const [roll, setRoll] = useState<[number, number] | null>(null)

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display text-2xl">Shogun&apos;s Dice</h3>
      <p className="text-sm text-muted-foreground">Costs 5 gold. Eight or higher grants +4 XP. Entertainment only.</p>
      <button
        type="button"
        className="press mt-4 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        onClick={() => {
          const a = 1 + Math.floor(Math.random() * 6)
          const b = 1 + Math.floor(Math.random() * 6)
          setRoll([a, b])
          const honor = a + b >= 8 ? 4 : 0
          dispatch({
            type: "PLAY_GAME",
            gameId: "shogun-dice",
            goldCost: 5,
            xpReward: honor,
            note: "Shogun's Dice",
          })
        }}
      >
        Spend 5 Gold and roll
      </button>
      {roll ? (
        <p className="mt-3 font-display text-xl text-gold">
          {roll[0]} + {roll[1]} = {roll[0] + roll[1]}
        </p>
      ) : null}
      <button type="button" className="mt-4 text-sm text-muted-foreground" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

function MemoryMatch({ onClose }: { onClose: () => void }) {
  const { dispatch } = useGame()
  const symbols = ["桜", "月", "灯", "剣"]
  const deck = useMemo(
    () =>
      [...symbols, ...symbols]
        .map((symbol, index) => ({ id: index, symbol, face: false }))
        .sort(() => Math.random() - 0.5),
    [],
  )
  const [cards, setCards] = useState(deck)
  const [picked, setPicked] = useState<number[]>([])
  const [paid, setPaid] = useState(false)
  const matched = cards.filter((card) => card.face).length === cards.length && cards.length > 0

  function payAndStart() {
    dispatch({
      type: "PLAY_GAME",
      gameId: "memory-match",
      goldCost: 8,
      xpReward: 0,
      note: "Sakura Memory",
    })
    setPaid(true)
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display text-2xl">Sakura Memory</h3>
      {!paid ? (
        <button type="button" className="press mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" onClick={payAndStart}>
          Spend 8 Gold
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className="press glass h-16 rounded-xl font-display text-xl"
              onClick={() => {
                if (card.face || picked.length === 2) return
                const nextPicked = [...picked, index]
                const next = cards.map((item, i) => (i === index ? { ...item, face: true } : item))
                setCards(next)
                setPicked(nextPicked)
                if (nextPicked.length === 2) {
                  const [a, b] = nextPicked
                  if (next[a].symbol !== next[b].symbol) {
                    window.setTimeout(() => {
                      setCards((current) =>
                        current.map((item, i) => (i === a || i === b ? { ...item, face: false } : item)),
                      )
                      setPicked([])
                    }, 700)
                  } else {
                    setPicked([])
                    if (next.every((item) => item.face)) {
                      dispatch({
                        type: "PLAY_GAME",
                        gameId: "memory-match-win",
                        goldCost: 0,
                        xpReward: 8,
                        note: "Sakura Memory honor",
                      })
                    }
                  }
                }
              }}
            >
              {card.face ? card.symbol : "◆"}
            </button>
          ))}
        </div>
      )}
      {matched && paid ? <p className="mt-3 text-gold">All petals matched. +8 XP</p> : null}
      <button type="button" className="mt-4 text-sm text-muted-foreground" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

function LanternFlash({ onClose }: { onClose: () => void }) {
  const { dispatch } = useGame()
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "done">("idle")
  const [result, setResult] = useState("")

  function start() {
    dispatch({
      type: "PLAY_GAME",
      gameId: "lantern-flash",
      goldCost: 6,
      xpReward: 0,
      note: "Lantern Flash",
    })
    setPhase("wait")
    window.setTimeout(() => setPhase("go"), 700 + Math.random() * 1600)
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display text-2xl">Lantern Flash</h3>
      <p className="text-sm text-muted-foreground">Spend 6 gold. Tap only when the lantern blooms.</p>
      {phase === "idle" ? (
        <button type="button" className="press mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" onClick={start}>
          Spend 6 Gold
        </button>
      ) : (
        <button
          type="button"
          className={`press mt-6 h-32 w-full rounded-2xl ${phase === "go" ? "bg-lantern/70" : "bg-background/40"}`}
          onClick={() => {
            if (phase === "wait") {
              setResult("Too soon.")
              setPhase("done")
              return
            }
            if (phase === "go") {
              setResult("Caught the bloom. +5 XP")
              dispatch({
                type: "PLAY_GAME",
                gameId: "lantern-flash-win",
                goldCost: 0,
                xpReward: 5,
                note: "Lantern Flash honor",
              })
              setPhase("done")
            }
          }}
        >
          {phase === "go" ? "Now" : "Wait"}
        </button>
      )}
      {result ? <p className="mt-3 text-gold">{result}</p> : null}
      <button type="button" className="mt-4 text-sm text-muted-foreground" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

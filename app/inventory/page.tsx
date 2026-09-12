"use client"

import { useMemo, useState } from "react"
import { Coins, Crown, Gamepad2, Package, Sparkles } from "lucide-react"
import { useGame } from "@/components/game-provider"
import { GOLD_SHOP, MINI_GAMES } from "@/lib/shop"

type GameId = "shogun-dice" | "memory-match" | "lantern-flash"

export default function InventoryPage() {
  const { state, dispatch, error, notice } = useGame()
  const [activeGame, setActiveGame] = useState<GameId | null>(null)

  return (
    <main className="mt-6 flex flex-1 flex-col gap-6">
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-primary/10 opacity-50" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-primary" aria-hidden="true" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reward & rest</p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-wide sm:text-4xl">Inventory</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A quiet room for trophies, gold crafts, and short rest games. No wagers. No real money. Spend gold you earned from quests.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-background/40 px-3 py-1.5 text-sm ring-1 ring-border">
            <Coins className="size-4 text-gold" aria-hidden="true" />
            <span className="font-medium">{state.gold} gold</span>
            <span className="text-muted-foreground">· use gold to acquire keepsakes or play</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">
          <Crown className="size-4 text-gold" aria-hidden="true" /> Items
          <span className="rounded-full bg-background/40 px-2 py-0.5 text-xs font-normal tracking-normal ring-1 ring-border">
            {state.inventory.length}
          </span>
        </h2>
        {state.inventory.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-background/30 ring-1 ring-border">
              <Package className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-lg">No keepsakes yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Trophies and keepsakes appear as you complete the path and visit the gold shop.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {state.inventory.map((item) => (
              <li key={item.id} className="glass glass-hover rounded-2xl p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">{item.slot}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                <p className="mt-2 text-xs text-muted-foreground">Acquired {new Date(item.acquiredAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">
          <Coins className="size-4 text-gold" aria-hidden="true" /> Gold shop
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GOLD_SHOP.map((item) => {
            const owned = state.inventory.some((ownedItem) => ownedItem.id === item.id)
            const canAfford = state.gold >= item.cost
            return (
              <li key={item.id} className="glass flex flex-col rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-gold">
                      <Coins className="size-3" aria-hidden="true" />
                      {item.cost} Gold
                    </p>
                    <h3 className="font-display text-lg">{item.name}</h3>
                  </div>
                  {owned ? (
                    <span className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary ring-1 ring-primary/20">Owned</span>
                  ) : !canAfford ? (
                    <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs text-destructive ring-1 ring-destructive/20">Need gold</span>
                  ) : null}
                </div>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.note}</p>
                <button
                  type="button"
                  disabled={owned || !canAfford}
                  onClick={() => dispatch({ type: "BUY_ITEM", shopId: item.id })}
                  className="press mt-3 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm ring-1 ring-primary/30 disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {owned ? "Owned" : `Acquire — ${item.cost} gold`}
                </button>
              </li>
            )
          })}
        </ul>
        {error || notice ? (
          <p className={`mt-3 rounded-xl px-3 py-2 text-sm ring-1 ${error ? "bg-destructive/10 text-destructive ring-destructive/20" : "bg-primary/10 text-primary ring-primary/20"}`}>
            {error || notice}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">
          <Gamepad2 className="size-4 text-primary" aria-hidden="true" /> Rest / mini games
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {MINI_GAMES.map((game) => (
            <li key={game.id} className="glass flex flex-col rounded-2xl p-4">
              <h3 className="font-display text-lg">{game.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{game.blurb}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold">
                <Coins className="size-3.5" aria-hidden="true" />
                {game.cost} Gold to play
              </p>
              <button
                type="button"
                disabled={state.gold < game.cost}
                onClick={() => setActiveGame(game.id as GameId)}
                className="press mt-3 w-full rounded-xl bg-background/40 px-3 py-2 text-sm ring-1 ring-border hover:bg-background/60 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </main>
  )
}

function ShogunDice({ onClose }: { onClose: () => void }) {
  const { dispatch, state } = useGame()
  const [roll, setRoll] = useState<[number, number] | null>(null)
  const canAfford = state.gold >= 5

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display flex items-center gap-2 text-2xl">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">🎲</span>
        Shogun&apos;s Dice
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Costs 5 gold · Eight or higher grants +4 XP. Entertainment only. Gold is earned from quests.</p>
      {!canAfford ? <p className="mt-2 text-sm text-destructive">Not enough gold — complete quests to earn.</p> : null}
      <button
        type="button"
        disabled={!canAfford}
        className="press mt-4 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md ring-1 ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {roll[0]} + {roll[1]} = {roll[0] + roll[1]} {roll[0] + roll[1] >= 8 ? "· +4 XP" : "· try again"}
        </p>
      ) : null}
      <button type="button" className="mt-4 text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

function MemoryMatch({ onClose }: { onClose: () => void }) {
  const { dispatch, state } = useGame()
  const symbols = ["桜", "月", "灯", "剣"]
  const deck = useMemo(
    () =>
      [...symbols, ...symbols]
        .map((symbol, index) => ({ id: index, symbol, face: false }))
        .sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [cards, setCards] = useState(deck)
  const [picked, setPicked] = useState<number[]>([])
  const [paid, setPaid] = useState(false)
  const matched = cards.filter((card) => card.face).length === cards.length && cards.length > 0
  const canAfford = state.gold >= 8

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
      <h3 className="font-display flex items-center gap-2 text-2xl">
        <span className="flex size-8 items-center justify-center rounded-xl bg-sakura/15 ring-1 ring-sakura/20">桜</span>
        Sakura Memory
      </h3>
      <p className="text-sm text-muted-foreground">Match four petal pairs. Costs 8 gold to start. Match all for +8 XP.</p>
      {!paid ? (
        <>
          {!canAfford ? <p className="mt-2 text-sm text-destructive">Not enough gold.</p> : null}
          <button
            type="button"
            disabled={!canAfford}
            className="press mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md ring-1 ring-primary/30 disabled:opacity-50"
            onClick={payAndStart}
          >
            Spend 8 Gold
          </button>
        </>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className="press glass flex h-16 items-center justify-center rounded-xl font-display text-xl"
              aria-label={card.face ? `Card ${card.symbol}` : "Hidden card"}
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
      {matched && paid ? <p className="mt-3 flex items-center gap-1.5 text-gold"><Sparkles className="size-4" aria-hidden="true" /> All petals matched. +8 XP</p> : null}
      <button type="button" className="mt-4 text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

function LanternFlash({ onClose }: { onClose: () => void }) {
  const { dispatch, state } = useGame()
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "done">("idle")
  const [result, setResult] = useState("")
  const canAfford = state.gold >= 6

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
      <h3 className="font-display flex items-center gap-2 text-2xl">
        <span className="flex size-8 items-center justify-center rounded-xl bg-lantern/15 ring-1 ring-lantern/20">🏮</span>
        Lantern Flash
      </h3>
      <p className="text-sm text-muted-foreground">Spend 6 gold. Tap only when the lantern blooms. Tests reaction, not gold.</p>
      {phase === "idle" ? (
        <>
          {!canAfford ? <p className="mt-2 text-sm text-destructive">Not enough gold.</p> : null}
          <button
            type="button"
            disabled={!canAfford}
            className="press mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md ring-1 ring-primary/30 disabled:opacity-50"
            onClick={start}
          >
            Spend 6 Gold
          </button>
        </>
      ) : (
        <button
          type="button"
          className={`press mt-6 h-32 w-full rounded-2xl text-sm font-semibold ring-1 ${phase === "go" ? "bg-lantern text-background ring-lantern/50 shadow-lg" : "bg-background/40 text-muted-foreground ring-border"}`}
          onClick={() => {
            if (phase === "wait") {
              setResult("Too soon — patience.")
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
          {phase === "go" ? "TAP NOW — Lantern Bloomed!" : phase === "wait" ? "Wait for bloom…" : result}
        </button>
      )}
      {result ? <p className="mt-3 text-gold">{result}</p> : null}
      <button type="button" className="mt-4 text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

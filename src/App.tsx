import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Subject } from "rxjs"

const X = 0
const Y = 1

class Engine {
  field = Array.from({ length: 13 }).map((e, x) => Array.from({ length: 4 }).map((e, y) => {
    return {
      pos: [x, y],
      location: "pioche",
    }
  }))
  lastDefausse!: typeof Engine.prototype.field[0][0]
  turn = "hero"
  waitAction = "take"

  e = {
    gameUpdate: new Subject<void>()
  }

  constructor() {
    console.log("NEW ENGINE");
  }

  discard() {

  }

  take(fromDefausse: boolean) {
    const card = fromDefausse ? this.lastDefausse : this.getRandomCardFromPioche()
    card.location = this.turn
    this.e.gameUpdate.next()
  }

  // card? : typeof Engine.prototype.field[0][0]

  nextTurn() {
    this.turn = this.turn = "hero" ? "vilain" : "hero"
  }

  getRandomCardFromPioche() {
    while (true) {
      const card = this.field[Math.floor(Math.random() * 13)][Math.floor(Math.random() * 4)]
      if (card.location === 'pioche') {
        return card
      }
    }
  }

  start() {
    // console.log("START");
    const giveCards = (player: string) => {
      let amountGiven = 0;
      Array.from({ length: 10 }).forEach(() => {
        const card = this.getRandomCardFromPioche()
        card.location = player
      })
    }
    this.getRandomCardFromPioche().location = "pioche"
    giveCards("vilain")
    giveCards("hero")
    const card = this.getRandomCardFromPioche()
    card.location = "defausse"
    this.lastDefausse = card
    this.e.gameUpdate.next()
  }
}

function Card(p: { card: any }) {
  return <div
    style={{
      width: "100%",
      height: "24%",
      border: "1px solid black",
      background: p.card.location === "hero" ? "green" : "grey",
      borderRadius: "5%"
    }}
  >
  </div>
}

function Game() {
  const [field, setField] = useState<typeof Engine.prototype.field>([[]])
  const engine = useMemo(() => new Engine, [])

  useEffect(() => {
    const obs = engine.e.gameUpdate.subscribe(() => {
      setField(engine.field as any)
    })
    engine.start()
  }, [])

  return <>
    <div style={{
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "space-around",
    }}>
      {field.map((x, ix) => {
        return <div style={{
          display: "flex",
          justifyContent: "space-around",
          flexDirection: "column",
          width: "7%",
          height: "100%",
        }}
          key={ix}
        >
          {x.map((card, iy) => {
            return <Card card={card} key={iy}></Card>
          })}
        </div>
      })}
    </div>
  </>
}

function App() {
  return <>
    <div style={{
      width: "100vw",
      height: "50vh",
      border: '1px solid grey',
    }}>
      <Game></Game>
    </div>
  </>
}

export default App;

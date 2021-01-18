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

  discard = (card: typeof Engine.prototype.field[0][0]) => {
    console.log(card);
    card.location = "defausse"
    this.waitAction = "take"
    this.turn = this.turn = "hero" ? "vilain" : "hero"
    this.e.gameUpdate.next()
  }

  take = (fromDefausse: boolean) => {
    const card = fromDefausse ? this.lastDefausse : this.getRandomCardFromPioche()
    card.location = this.turn
    this.waitAction = "discard"
    this.e.gameUpdate.next()
  }

  getRandomCardFromPioche = () => {
    while (true) {
      const card = this.field[Math.floor(Math.random() * 13)][Math.floor(Math.random() * 4)]
      if (card.location === 'pioche') {
        return card
      }
    }
  }

  start = () => {
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

const bot = async (engine: Engine) => {
    engine.take(Math.random() > 0.5)
}

function Card(p: { engine: Engine, card: typeof Engine.prototype.field[0][0] }) {
  const [backColor, setBackColor] = useState("grey")

  useEffect(() => {
    if (p.card.location === "hero") {
      setBackColor("green")
    } else if (p.card.location === "defausse") {
      setBackColor("purple")
    } else {
      setBackColor("grey")
    }
  })

  return <div
    onClick={() => {
      if (p.engine.turn === "hero") {
        if (p.engine.waitAction === "take") {
          if (p.card.location === "defausse") {
            p.engine.take(true)
          } else if (p.card.location === "pioche") {
            p.engine.take(false)
          }
        } else if (p.engine.waitAction === "discard") {
          p.engine.discard(p.card)
        }
      }
    }}
    style={{
      width: "100%",
      height: "24%",
      border: "1px solid black",
      background: backColor,
      borderRadius: "5%"
    }}
  >
  </div>
}

function Game() {
  const engine = useMemo(() => new Engine, [])
  const [s, setS] = useState<{ game: Engine }>({ game: engine })
  // const [field, setField] = useState<typeof Engine.prototype.field>([[]])

  useEffect(() => {
    const obs = engine.e.gameUpdate.subscribe(() => {
      console.log(engine);
      setS({ game: engine })
    })
    engine.start()
    return () => {
      obs.unsubscribe()
    }
  }, [])

  return <>
    <div style={{
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "space-around",
    }}>
      {s.game.field.map((x, ix) => {
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
            return <Card
              engine={engine}
              card={card} key={iy}></Card>
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

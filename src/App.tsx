import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Subject } from "rxjs"
import { createTextSpanFromBounds } from 'typescript';

const X = 0
const Y = 1

class Engine {
  field = Array.from({ length: 13 }).map((e, x) => Array.from({ length: 4 }).map((e, y) => {
    return {
      pos: [x, y],
      location: "pioche",
      openTook: ""
    }
  }))
  lastDefausse!: typeof Engine.prototype.field[0][0]
  turn = "hero"
  waitAction = "take"
  hasKnock = false;

  e = {
    gameUpdate: new Subject<void>()
  }

  constructor() {
    console.log("NEW ENGINE");
  }

  knock = () => {
    const founds: any[] = []

    for (let y = 0; y < 4; y++) {
      let found = []
      for (let x = 0; x < 13; x++) {
        if (this.field[x][y].location !== this.turn) {
          if (found.length >= 3) {
            founds.push(found)
            found = [];
          } else {
            found = [];
          }
        } else if (this.field[x][y].location === this.turn) {
          found.push(this.field[x][y])
        }
      }
    }
    for (let x = 0; x < 13; x++) {
      let found = []
      for (let y = 0; y < 4; y++) {
        if (this.field[x][y].location === this.turn){
          found.push(this.field[x][y])
        }
      }
      if (found.length >= 3){
        founds.push(found)
      }
    }

    if (founds.length >= 4){
      return 0
    }

    console.log(founds);
  }

  discard = (card: typeof Engine.prototype.field[0][0]) => {
    card.location = "defausse"
    card.openTook = ""
    if (this.hasKnock) {
      this.knock()
      return;
    }
    this.waitAction = "take"
    this.turn = this.turn == "hero" ? "vilain" : "hero"
    this.lastDefausse = card
    this.e.gameUpdate.next()
  }

  take = (fromDefausse: boolean) => {
    console.log(this.turn, "TAKE");
    const card = fromDefausse ? this.lastDefausse : this.getRandomCardFromPioche()
    if (fromDefausse) {
      card.openTook = this.turn
    }
    card.location = this.turn
    this.waitAction = "discard"
    this.e.gameUpdate.next()
  }

  getRandomCardFromPlayer = (player: string) => {
    while (true) {
      const card = this.field[Math.floor(Math.random() * 13)][Math.floor(Math.random() * 4)]
      if (card.location === player) {
        return card
      }
    }
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
  const TIME_WAIT = 100
  await new Promise(resolve => setTimeout(resolve, TIME_WAIT))
  engine.take(Math.random() > 0.5)
  await new Promise(resolve => setTimeout(resolve, TIME_WAIT))
  engine.discard(engine.getRandomCardFromPlayer("vilain"))
}

function Card(p: { engine: Engine, card: typeof Engine.prototype.field[0][0] }) {
  const [backColor, setBackColor] = useState("grey")

  useEffect(() => {
    if (p.card.location === "hero") {
      setBackColor("green")
    } else if (p.card.location === "defausse") {
      if (p.engine.turn === "hero" && p.engine.lastDefausse === p.card && p.engine.waitAction === "take") {
        setBackColor("#002401")
      } else {
        setBackColor("blue")
      }
    } else {
      setBackColor("grey")
    }
    if (p.card.openTook === "vilain") {
      setBackColor("red")
    }
  })

  return <div
    onClick={() => {
      if (p.engine.turn === "hero") {
        if (p.engine.waitAction === "take") {
          if (p.card === p.engine.lastDefausse) {
            p.engine.take(true)
          } else {
            p.engine.take(false)
          }
        } else if (p.engine.waitAction === "discard") {
          if (p.card.location === "hero") {
            p.engine.discard(p.card)
          }
        }
        if ((p.engine.turn as any) === "vilain") {
          bot(p.engine)
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
    {p.card.pos[X] + 1}
  </div>
}

function Game() {
  const engine = useMemo(() => new Engine, [])
  const [s, setS] = useState<{ game: Engine }>({ game: engine })
  // const [field, setField] = useState<typeof Engine.prototype.field>([[]])

  useEffect(() => {
    const obs = engine.e.gameUpdate.subscribe(() => {
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
    <button onClick={() => {
      engine.hasKnock = true;
    }}>
      Knock
    </button>
  </>
}

function App() {
  const [gameId, setGameId] = useState(0)

  return <>
    <div style={{
      width: "100vw",
      height: "50vh",
      border: '1px solid grey',
    }}>
      <Game key={gameId}></Game>
      <div style={{
        height: "40px",
      }}>

      </div>
      <button onClick={() => {
        setGameId((e) => e + 1)
      }}>new game</button>
    </div>
  </>
}

export default App;

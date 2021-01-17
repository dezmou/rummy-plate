import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Subject } from "rxjs"

const X = 0
const Y = 1

class Engine {
  field = Array.from({ length: 13 }).map((e, x) => Array.from({ length: 4 }).map((e, y) => {
    return {
      pos: [x, y],
      location: "void",
    }
  }))
  e = {
    fieldUpdate: new Subject<void>()
  }

  constructor() {
    console.log("NEW ENGINE");
  }


  start() {
    // console.log("START");
    const giveCards = (player: string) => {
      const getRandomCard = () => this.field[Math.floor(Math.random() * 13)][Math.floor(Math.random() * 4)]
      let amountGiven = 0;
      const card = getRandomCard()
      console.log(card);
      while (amountGiven < 10) {
        const card = getRandomCard()
        if (card.location == "void") {
          card.location = player
          amountGiven += 1
        }
      }
    }
    giveCards("vilain")
    giveCards("hero")
    this.e.fieldUpdate.next()
  }
}

function Card(p: { card: any }) {

  return <div
    style={{
      width: "100%",
      height: "24%",
      border: "1px solid black",
      background: p.card.location === "hero" ? "green" : "grey"
    }}
  >

  </div>
}


function Game() {
  const [field, setField] = useState([[]])
  const engine = useMemo(() => new Engine, [])

  useEffect(() => {
    const obs = engine.e.fieldUpdate.subscribe(() => {
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
      width: "70vw",
      height: "50vh",
      border: '1px solid grey',
    }}>
      <Game></Game>
    </div>
  </>
}

export default App;

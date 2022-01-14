import { render } from 'react-dom'
import React, { useState } from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import './styles.css'

const cards = [
  "https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/khole.png?alt=media&token=d34bcd9a-a507-45f5-bcd9-0a5f2fb4dd61",
  'https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/263488904_998102661053863_3446341293294128480_n.jpg?alt=media&token=ab7c5799-dc46-4031-9af6-57ddd6cf1e78',
  'https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/264331475_659474978411471_1195250061594596362_n.jpg?alt=media&token=f313a2a9-7ac8-4cb2-aae7-a35ab1e931ee',
  'https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/266201690_297533955650337_5248116302574214107_n.jpg?alt=media&token=f041ca11-d34d-4d88-aa1b-ffc208e9a6be',
  'https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/270207000_1245304852622079_7612806333889028947_n.jpg?alt=media&token=0eb7b46b-285c-4086-97f6-38d15e8bc7ca',
  'https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/bun3.jpg?alt=media&token=2777501f-ea7a-4430-b096-09ae1c9b082d',
  "https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/beocard3.png?alt=media&token=bcaedc8e-3a32-4c03-8903-e23a42b2b077",
 "https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/beocard2.png?alt=media&token=41a87235-6d78-4f77-914d-819ff2201863",
  'https://firebasestorage.googleapis.com/v0/b/bettertinder-4ff52.appspot.com/o/beocard.png?alt=media&token=c01854ab-db5b-4f7c-bb28-f3e416c9a064'
]

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = i => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 })
const from = i => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [props, set] = useSprings(cards.length, i => ({ ...to(i), from: from(i) })) // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useGesture(({ args: [index], down, delta: [xDelta], distance, direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right
    if (!down && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    set(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
    })
    if (!down && gone.size === cards.length) setTimeout(() => gone.clear() || set(i => to(i)), 600)
  })
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return props.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
      <animated.div {...bind(i)} style={{ transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i]})` }} />
    </animated.div>
  ))
}

render(<Deck />, document.getElementById('root'))

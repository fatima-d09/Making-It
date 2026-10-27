# Making It

A pixel-art life sim set in New York. Make a character, pick a starter job, and try to keep up with rent, the subway, your roommate and your own needs. Pick up better jobs and move into nicer apartments as you go.

## Stack

- **React 19 + TypeScript**, built with **Vite**
- **Tailwind CSS v4** for styling (design tokens live in `src/index.css` under `@theme`)
- **Canvas 2D** for the game scene. Every sprite is drawn in code with `fillRect`, so there are no image files.
- A small store hook built on React's `useSyncExternalStore` (`src/store/createStore.ts`). It works like Zustand: components subscribe with selectors, and the canvas engine reads and writes the same store outside React.
- `localStorage` for saves

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
```

## How the code is organized

```
src/
  data/        static game data: jobs, apartments, items, creator options, layouts
  game/        the simulation. pure TypeScript, no React, no canvas
    sim.ts         needs, money, the day cycle, rent, travel, moving, jobs
    activities.ts  what each action does (cook, work a shift, go to the bathroom...)
    types.ts       GameState and friends
  engine/      the pixel scene. no React here either
    sprites.ts     the character renderer (all the hair/clothes/face options)
    scenes/        apartment, street, subway, mall, workplaces
    world.ts       scene state: camera, NPCs, walk-to spots
    anim.ts        animation queue (walk → speech bubble → fade → update the sim)
    actions.ts     what you can do in each place + how each one animates
    input.ts       keyboard walking, "press E" hotspots
    loop.ts        the requestAnimationFrame loop
  store/       the store + runSim()
  components/  React UI: creator, HUD, side panel tabs, modals
```

### The three layers

1. **The sim (`game/`)** is plain functions that take a `GameState` and change it. It never touches React or the canvas. When it needs the UI (an offer came in, rent is late), it pushes a modal description into an `fx` object instead.
2. **`runSim(fn)`** in the store copies the state with `structuredClone`, runs the sim function on the copy, saves it, and swaps it in. React sees a brand new object and re-renders. Any modals the sim asked for get queued.
3. **The engine (`engine/`)** reads the store every frame and draws. Clicking an action doesn't change the game right away. It queues animation steps (walk to the stove, show "sizzle", fade out), and the sim only updates when the animation reaches that point.

## Controls

- `←` `→` or `A` `D`: walk
- `E`: use whatever you're standing next to
- `G`: go somewhere
- `M`: mood tracker
- `1`–`4`: side panel tabs
- Click the scene to skip an animation.

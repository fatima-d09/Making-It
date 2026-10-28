# Making It 

a little pixel art life sim set in new york. you make a character, pick a starter job, and try not to get evicted lol

**play it here:** <a href="https://fatima-d09.github.io/Making-It/" target="_blank" style="text-decoration: none; font-weight: bold;">LINK</a>

---

## what is it

kind of like the sims but way smaller and it's nyc. you pick one of 8 starter jobs (retail, intern, city gov, freelancer, server, resident doctor, remote customer success...) and that decides how much you make, how stable your job is, how tired you get, and where you can afford to live. some people start with roommates in bushwick, some people start in a 3 bed 2 bath in bay ridge.

then you just... live. go to work, take the train, buy groceries, pay rent, use the bathroom, hang out with your roommate, try to get a better job, move out.

## features

- character creator with a lot of options (hair, skin, clothes, hats, glasses, bags, etc). it says the number of possible combos on the screen and it's a dumb big number
- 8 starter jobs, all with different pay / schedules / stability
- your apartment is drawn based on where you live, and stuff you buy shows up in it
- walk around with the arrow keys and press E to use stuff
- subway rides with a card swipe animation and the train pulling in. sometimes there are signal problems (realistic)
- rideshare ("Swyft", made up) with surge pricing at rush hour
- roommates, partners, a kid and a cat that walk around and you can talk to them
- needs: energy, hunger, fun, social, bladder
- rent every 30 days, late fees, and you can get evicted
- recruiters randomly reach out, interviews, better paying offers
- apartment hunting with the 40x rent rule (landlords in nyc really do this)
- a mall where you can buy furniture, tech and clothes. you can take clothes on and off
- mood tracker that saves your mood every night
- saves automatically in your browser

## how to play

| key | what it does |
|---|---|
| ← → or A D | walk |
| E | use the thing you're standing next to |
| G | go somewhere |
| M | mood tracker |
| 1 2 3 4 | switch tabs |

you can also just click the buttons on the right. click the game screen to skip an animation.

## built with

- React + TypeScript
- Vite
- Tailwind CSS
- HTML canvas for all the pixel art (no images, every sprite is drawn with code)
- localStorage for saving

## running it locally

you need node installed.

```bash
npm install
npm run dev
```

then open http://localhost:5173

## putting it on github pages

there's two ways, pick one:

**option 1 (easier, uses the docs folder):**
1. push the repo to github
2. go to Settings → Pages
3. under "Build and deployment" pick **Deploy from a branch**, branch `main`, folder `/docs`
4. wait a minute and it should be live

the catch is `docs/index.html` is a built copy, so if you change the code you have to rebuild it yourself or it'll be out of date.

**option 2 (auto deploys every time you push):**
1. go to Settings → Pages
2. under "Build and deployment" pick **GitHub Actions**
3. push to `main`. the workflow in `.github/workflows/deploy.yml` builds the game and deploys it
4. check the Actions tab if it doesn't show up

## how the code is set up

```
src/
  data/        all the game data (jobs, apartments, items, creator options)
  game/        the actual game logic (money, rent, needs, days, jobs, moving)
  engine/      the canvas stuff (drawing people, scenes, animations, walking)
  store/       where the game state lives
  components/  the react ui (creator, hud, tabs, popups)
```

the main idea: the game logic in `game/` doesn't know about react or the canvas at all. it just takes the game state and changes it. the canvas engine reads the state every frame and draws it, and react shows the buttons and menus.

## stuff i learned

- drawing everything with `fillRect` is a lot of math but it's kind of fun once you get the hang of it
- keeping the game logic separate from the ui made it way easier to add stuff later
- requestAnimationFrame + a queue of animation "steps" is how i got the character to walk to the stove, cook, and then have the food actually count
- nyc rent is insane (i knew this already)

## known bugs

- if you spam buttons during a fade sometimes it feels a little weird
- the cat can walk through furniture 

---

fonts: Pixelify Sans, VT323 and Public Sans from Google Fonts. Swyft, Dashbite and MetroPass are made up names.

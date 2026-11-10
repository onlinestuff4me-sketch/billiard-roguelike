import { open, RETURNING } from './lib.mjs';
const out = process.argv[2];
const cap = await open({ storage: RETURNING });
const s = (n) => cap.shot(`${out}/${n}.jpg`);
await cap.run(2500); await s('01-home');
await cap.ev(() => document.getElementById('btn-play').click());
await cap.run(1200); await s('02-play');
await cap.ev(() => document.getElementById('play-continue').click());
for (let i = 0; i < 8; i++) { await cap.run(500); await s(`03-start-${i}`); }
console.log(await cap.ev(() => ({ state: __game.state, phase: __game.phase, intro: __game.introUp, level: __game.level })));
console.log(cap.errors);
await cap.close();

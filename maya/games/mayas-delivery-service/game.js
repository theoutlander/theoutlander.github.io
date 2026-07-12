"use strict";
/* ════════════════════════════════════════════════════════════════
   Maya's Delivery Service — Phaser 4
   Drive a van around town delivering packages to animal friends.
   Garage (unlock vehicles + pets), turbo, coins, day→night, weather,
   happy customers, animal facts, special packages & letters from Dad.
   ════════════════════════════════════════════════════════════════ */
let GW = Math.max(320, window.innerWidth || 0);
let GH = Math.max(240, window.innerHeight || 0);

/* ── palette ── */
const C = {
	bg: 0x0f0a1e,
	card: 0x1e1440,
	cardB: 0x3a2a5c,
	pink: 0xff6eb4,
	yellow: 0xffe14d,
	green: 0x5dffb0,
	blue: 0x5bc8ff,
	purple: 0xc77dff,
	orange: 0xff9a3c,
	white: 0xffffff,
	grass: 0x86d36b,
	grassD: 0x79c560,
	road: 0x5a5566,
	water: 0x5cc6e8,
};
const HX = {
	pink: "#ff6eb4",
	yellow: "#ffe14d",
	green: "#5dffb0",
	blue: "#5bc8ff",
	purple: "#c77dff",
	text: "#f0e6ff",
	muted: "rgba(240,230,255,.62)",
};

/* ── catalogs ── */
const VEHICLES = [
	{
		id: "van",
		name: "Mail Van",
		color: 0xff6eb4,
		cost: 0,
		spd: 1.0,
		turn: 1.0,
		scale: 1.0,
		mail: true,
	},
	{
		id: "scooter",
		name: "Zippy Scooter",
		color: 0x5bc8ff,
		cost: 60,
		spd: 1.06,
		turn: 1.42,
		scale: 0.82,
	},
	{
		id: "truck",
		name: "Big Truck",
		color: 0xff9a3c,
		cost: 140,
		spd: 0.94,
		turn: 0.86,
		scale: 1.26,
	},
	{
		id: "icecream",
		name: "Ice Cream Van",
		color: 0x5dffb0,
		cost: 230,
		spd: 1.0,
		turn: 1.06,
		scale: 1.08,
		swirl: true,
	},
	{
		id: "taxi",
		name: "Sunny Taxi",
		color: 0xffe14d,
		cost: 340,
		spd: 1.14,
		turn: 1.1,
		scale: 1.0,
		checker: true,
	},
	{
		id: "rainbow",
		name: "Rainbow Racer",
		color: 0xc77dff,
		cost: 550,
		spd: 1.26,
		turn: 1.2,
		scale: 1.0,
		rainbow: true,
	},
];
const PETS = [
	{ id: "dog", emoji: "🐶", name: "Puppy", cost: 0 },
	{ id: "cat", emoji: "🐱", name: "Kitty", cost: 40 },
	{ id: "bunny", emoji: "🐰", name: "Bunny", cost: 90 },
	{ id: "panda", emoji: "🐼", name: "Panda", cost: 170 },
	{ id: "unicorn", emoji: "🦄", name: "Unicorn", cost: 300 },
	{ id: "dragon", emoji: "🐲", name: "Dragon", cost: 480 },
];
const HOUSE_DEFS = [
	{
		name: "Rosie",
		hex: 0xff8fbf,
		emoji: "🐰",
		fact: "Bunnies can jump up to 3 feet high!",
	},
	{
		name: "Sunny",
		hex: 0xffd24a,
		emoji: "🐥",
		fact: "Baby chicks chirp before they even hatch!",
	},
	{
		name: "Coco",
		hex: 0x9b7bff,
		emoji: "🐨",
		fact: "Koalas sleep up to 22 hours a day!",
	},
	{
		name: "Pepper",
		hex: 0xff9a52,
		emoji: "🦊",
		fact: "Foxes use their fluffy tails like a blanket.",
	},
	{
		name: "Maple",
		hex: 0x67d59a,
		emoji: "🐢",
		fact: "Some turtles live more than 100 years!",
	},
	{
		name: "Bluebell",
		hex: 0x6fc4ff,
		emoji: "🐬",
		fact: "Dolphins call each other by special names!",
	},
	{
		name: "Ziggy",
		hex: 0xff7a7a,
		emoji: "🦖",
		fact: "T. rex had teeth as big as bananas!",
	},
	{
		name: "Pip",
		hex: 0xc2f06a,
		emoji: "🐸",
		fact: "Frogs drink water through their skin!",
	},
	{
		name: "Bamboo",
		hex: 0xb6e36a,
		emoji: "🐼",
		fact: "Pandas eat bamboo for 12 hours a day!",
	},
	{
		name: "Waddle",
		hex: 0x7fd4ff,
		emoji: "🐧",
		fact: "Penguins propose with a pretty pebble!",
	},
	{
		name: "Leo",
		hex: 0xffc24a,
		emoji: "🦁",
		fact: "A lion's roar can be heard 5 miles away!",
	},
	{
		name: "Inky",
		hex: 0xc98bff,
		emoji: "🐙",
		fact: "Octopuses have THREE hearts!",
	},
	{
		name: "Buzz",
		hex: 0xffe06a,
		emoji: "🐝",
		fact: "Bees dance to tell friends where flowers are!",
	},
	{
		name: "Splash",
		hex: 0x6fd0c4,
		emoji: "🐳",
		fact: "A blue whale's heart is as big as a car!",
	},
];
const DAD_NOTES = [
	"I love you to the moon and back! 🌙",
	"So proud of you, Maya! ⭐",
	"Can't wait for our call tonight! 💕",
	"You're the best driver in the world! 🏆",
	"Give your pet a hug for me! 🐶",
	"Miss you, kiddo. Drive safe! 🚐",
	"Whenever you miss me, look up at the moon — I'm looking too. 🌙",
	"I keep your drawings where I can see them every day. 🖼️💕",
	"You make my whole world brighter, Maya. ☀️",
	"No matter what, I'm always in your corner. 💛",
	"Being your dad is my favourite adventure. 🚐💕",
	"You're braver than you know, kiddo. 🦁",
	"Save me the first turn at our next game, okay? 🎮",
	"Dream the biggest dreams tonight, superstar. ✨",
];

/* ── shared state (persisted) ── */
const G = {
	coins: 0,
	soundOn: true,
	musicOn: true,
	hinted: false,
	vehicle: "van",
	pet: "dog",
	ownedV: ["van"],
	ownedP: ["dog"],
	bestStars: 0,
	track: 0,
	lettersSeen: [],
	load() {
		try {
			const s = JSON.parse(localStorage.getItem("mds3") || "{}");
			this.coins = s.coins || 0;
			this.vehicle = s.vehicle || "van";
			this.pet = s.pet || "dog";
			this.track = s.track || 0;
			this.ownedV = s.ownedV || ["van"];
			this.ownedP = s.ownedP || ["dog"];
			this.bestStars = s.bestStars || 0;
			this.lettersSeen = Array.isArray(s.lettersSeen) ? s.lettersSeen : [];
			this.soundOn = s.soundOn !== false;
			this.musicOn = s.musicOn !== false;
			if (!this.ownedV.includes("van")) this.ownedV.push("van");
			if (!this.ownedP.includes("dog")) this.ownedP.push("dog");
		} catch (e) {}
	},
	save() {
		try {
			localStorage.setItem(
				"mds3",
				JSON.stringify({
					coins: this.coins,
					vehicle: this.vehicle,
					pet: this.pet,
					ownedV: this.ownedV,
					ownedP: this.ownedP,
					bestStars: this.bestStars,
					soundOn: this.soundOn,
					musicOn: this.musicOn,
					track: this.track,
					lettersSeen: this.lettersSeen,
				}),
			);
		} catch (e) {}
	},
	veh() {
		return VEHICLES.find((v) => v.id === this.vehicle) || VEHICLES[0];
	},
	petDef() {
		return PETS.find((p) => p.id === this.pet) || PETS[0];
	},
};

/* pick a Dad letter to show — prefer one Maya hasn't collected yet — and remember it for the scrapbook */
function recordDadLetter() {
	const seen = G.lettersSeen || (G.lettersSeen = []);
	const unseen = [];
	for (let i = 0; i < DAD_NOTES.length; i++) {
		if (seen.indexOf(i) < 0) unseen.push(i);
	}
	const idx = unseen.length
		? unseen[Math.floor(Math.random() * unseen.length)]
		: Math.floor(Math.random() * DAD_NOTES.length);
	if (seen.indexOf(idx) < 0) {
		seen.push(idx);
		G.save();
	}
	return idx;
}

/* ── themes: each route gets a fun flavour ── */
const THEMES = {
	normal: { label: "", emoji: "" },
	party: { label: "Party Day!", emoji: "🎈" },
	birthday: { label: "Birthday Day!", emoji: "🎂" },
	pizza: { label: "Pizza Night!", emoji: "🍕" },
	rainbow: { label: "Rainbow Day!", emoji: "🌈" },
};
function chooseTheme() {
	const r = Math.random();
	if (r < 0.22) return "party";
	if (r < 0.37) return "birthday";
	if (r < 0.52) return "pizza";
	if (r < 0.64) return "rainbow";
	return "normal";
}

/* ── per-animal sounds (synth tones, no audio files) ── */
function animalSound(emoji) {
	const two = (f1, f2, t, type, v) => {
		beep(f1, t, type, v);
		setTimeout(() => beep(f2, t, type, v), t * 900);
	};
	switch (emoji) {
		case "🐶":
		case "🐕":
			two(240, 180, 0.1, "square", 0.18);
			break; // woof woof
		case "🐱":
		case "🐈":
			beep(650, 0.18, "sawtooth", 0.15, 520);
			setTimeout(() => beep(540, 0.14, "sawtooth", 0.13, 660), 120);
			break; // meow
		case "🐰":
		case "🐇":
			beep(1000, 0.07, "sine", 0.12, 1300);
			break; // squeak
		case "🐥":
		case "🐤":
		case "🐓":
		case "🦃":
			beep(1900, 0.06, "sine", 0.12, 2500);
			setTimeout(() => beep(2200, 0.06, "sine", 0.1, 2600), 80);
			break; // tweet
		case "🦁":
			beep(150, 0.38, "sawtooth", 0.2, 90);
			break; // roar
		case "🐸":
			two(190, 150, 0.11, "square", 0.16);
			break; // ribbit
		case "🐝":
			beep(260, 0.32, "sawtooth", 0.12, 230);
			break; // buzz
		case "🐖":
		case "🐑":
		case "🐐":
			beep(180, 0.3, "sawtooth", 0.16, 150);
			break; // moo/baa
		case "🐳":
		case "🐬":
			beep(900, 0.4, "sine", 0.12, 1500);
			break; // whale whistle
		case "🦆":
		case "🦢":
			two(520, 440, 0.1, "square", 0.14);
			break; // quack
		case "🦔":
		case "🐿️":
			beep(1400, 0.05, "sine", 0.1, 1700);
			break; // tiny chitter
		case "🐨":
		case "🐼":
			beep(300, 0.16, "triangle", 0.14, 240);
			break; // soft grunt
		default:
			beep(820, 0.09, "triangle", 0.12, 1020); // cute blip
	}
}

/* ── audio ── */
let _actx, _master, _musicBus, _sfxBus;
function AC() {
	if (window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
	if (!_actx) {
		try {
			_actx = new (window.AudioContext || window.webkitAudioContext)();
		} catch (e) {}
	}
	return _actx;
}
function buses() {
	const c = AC();
	if (!c) return null;
	if (!_master) {
		_master = c.createDynamicsCompressor();
		_master.connect(c.destination);
		_musicBus = c.createGain();
		_musicBus.gain.value = 0.45;
		_musicBus.connect(_master);
		_sfxBus = c.createGain();
		_sfxBus.gain.value = 1.0;
		_sfxBus.connect(_master);
	}
	return { music: _musicBus, sfx: _sfxBus };
}
// briefly dip the music so a sound effect (horn!) always cuts through
function duckMusic(amt, ms) {
	const b = buses();
	if (!b) return;
	const c = AC(),
		g = b.music.gain;
	g.cancelScheduledValues(c.currentTime);
	g.setValueAtTime(amt, c.currentTime);
	g.linearRampToValueAtTime(0.45, c.currentTime + (ms || 350) / 1000);
}
function resumeAudio() {
	try {
		const c = AC();
		// "interrupted" is an iOS-only state (after a call, Siri, silent switch, etc.)
		if (c && c.state !== "running") c.resume();
	} catch (e) {}
}
// Fully unlock audio on mobile: resume the context AND play a 1-sample silent
// buffer — iOS Safari requires both, inside a real user gesture, or it stays mute.
function unlockAudio() {
	try {
		const c = AC();
		if (!c) return;
		if (c.state !== "running") c.resume();
		buses(); // make sure the bus graph exists before the first real sound
		const src = c.createBufferSource();
		src.buffer = c.createBuffer(1, 1, 22050);
		src.connect(c.destination);
		src.start(0);
	} catch (e) {}
}
// One-time global unlock: the FIRST touch/click/key anywhere wakes the audio,
// so by the time Maya taps the horn the context is already running.
(function installAudioUnlock() {
	if (typeof window === "undefined") return;
	const EVENTS = [
		"pointerdown",
		"touchstart",
		"touchend",
		"mousedown",
		"keydown",
		"click",
	];
	const kick = () => {
		unlockAudio();
		const c = AC();
		if (c && c.state === "running")
			EVENTS.forEach((ev) => window.removeEventListener(ev, kick, true));
	};
	EVENTS.forEach((ev) => window.addEventListener(ev, kick, true));
	// iOS interrupts audio when the tab backgrounds / device locks — re-wake it.
	document.addEventListener("visibilitychange", () => {
		if (!document.hidden) resumeAudio();
	});
})();
function beep(freq, dur, type = "sine", vol = 0.18, slideTo) {
	if (!G.soundOn) return;
	const c = AC();
	if (!c) return;
	const b = buses();
	try {
		const o = c.createOscillator(),
			g = c.createGain();
		o.connect(g);
		g.connect(b ? b.sfx : c.destination);
		o.type = type;
		o.frequency.value = freq;
		if (slideTo)
			o.frequency.linearRampToValueAtTime(slideTo, c.currentTime + dur);
		g.gain.setValueAtTime(0.0001, c.currentTime);
		g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.02);
		g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
		o.start();
		o.stop(c.currentTime + dur + 0.02);
	} catch (e) {}
}
const sfx = {
	pickup() {
		beep(520, 0.12, "triangle", 0.2, 820);
		setTimeout(() => beep(880, 0.13, "triangle", 0.18), 90);
	},
	deliver() {
		[523, 659, 784, 1047].forEach((f, i) =>
			setTimeout(() => beep(f, 0.15, "triangle", 0.2), i * 70),
		);
	},
	coin() {
		beep(1100, 0.07, "square", 0.12, 1500);
	},
	boost() {
		beep(200, 0.3, "sawtooth", 0.12, 700);
	},
	honk() {
		beep(330, 0.13, "square", 0.18);
		setTimeout(() => beep(247, 0.18, "square", 0.18), 140);
	},
	buy() {
		[659, 880, 1175].forEach((f, i) =>
			setTimeout(() => beep(f, 0.14, "triangle", 0.2), i * 90),
		);
	},
	deny() {
		beep(160, 0.18, "square", 0.14, 110);
	},
	bonk() {
		beep(140, 0.12, "square", 0.2, 70);
		setTimeout(() => beep(90, 0.14, "triangle", 0.16), 60);
	},
	win() {
		[523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
			setTimeout(() => beep(f, 0.22, "triangle", 0.22), i * 120),
		);
	},
};
/* cheerful car horn — layered "beep beep!" with a happy major chord */
function carHorn() {
	const c = AC();
	if (!c || !G.soundOn) return;
	const b = buses();
	duckMusic(0.1, 360);
	const toot = (t, f) => {
		const o1 = c.createOscillator(),
			o2 = c.createOscillator(),
			o3 = c.createOscillator(),
			g = c.createGain();
		o1.type = "triangle";
		o2.type = "triangle";
		o3.type = "square";
		o1.frequency.value = f;
		o2.frequency.value = f * 1.25;
		o3.frequency.value = f * 0.5;
		o1.connect(g);
		o2.connect(g);
		o3.connect(g);
		g.connect(b ? b.sfx : c.destination);
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.22, t + 0.015);
		g.gain.setValueAtTime(0.22, t + 0.1);
		g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
		[o1, o2, o3].forEach((o) => {
			o.start(t);
			o.stop(t + 0.2);
		});
	};
	const now = c.currentTime;
	toot(now, 523.25);
	toot(now + 0.17, 523.25);
}
/* gentle looping music — multiple tracks */
let _mTimer = null,
	_mStep = 0;
const MSCALE = [
	523.25, 587.33, 659.25, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.5,
];
const TRACKS = [
	{
		name: "☀️ Sunny Drive",
		beat: 0.26,
		mel: [0, 2, 4, 2, 0, 4, 7, 4, 5, 4, 2, 0, 2, 4, 2, 0],
		bass: [130.81, 164.81, 196.0, 164.81],
	},
	{
		name: "🎈 Bouncy Town",
		beat: 0.2,
		mel: [4, 4, 2, 4, 7, 7, 4, 2, 0, 2, 4, 5, 4, 2, 0, 2],
		bass: [146.83, 146.83, 196.0, 174.61],
	},
	{
		name: "✨ Starlight",
		beat: 0.32,
		mel: [7, 6, 4, 2, 4, 2, 0, 2, 4, 5, 7, 8, 7, 5, 4, 2],
		bass: [110.0, 130.81, 164.81, 146.83],
	},
	{
		name: "🍭 Candy Pop",
		beat: 0.18,
		mel: [2, 4, 5, 7, 5, 4, 2, 0, 4, 7, 8, 7, 5, 4, 2, 4],
		bass: [164.81, 196.0, 220.0, 196.0],
	},
];
function curTrack() {
	return TRACKS[(G.track || 0) % TRACKS.length];
}
function mnote(f, dur, vol) {
	const c = AC();
	if (!c || !G.musicOn) return;
	const b = buses();
	try {
		const o = c.createOscillator(),
			g = c.createGain();
		o.connect(g);
		g.connect(b ? b.music : c.destination);
		o.type = "triangle";
		o.frequency.value = f;
		g.gain.setValueAtTime(0.0001, c.currentTime);
		g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.03);
		g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
		o.start();
		o.stop(c.currentTime + dur + 0.02);
	} catch (e) {}
}
function startMusic() {
	if (_mTimer) clearInterval(_mTimer);
	const tr = curTrack(),
		beat = tr.beat;
	_mTimer = setInterval(() => {
		if (!G.musicOn) return;
		const t = curTrack();
		const i = _mStep % t.mel.length;
		mnote(MSCALE[t.mel[i]], t.beat * 0.9, 0.04);
		if (_mStep % 2 === 0)
			mnote(t.bass[Math.floor(_mStep / 2) % t.bass.length], t.beat * 1.6, 0.05);
		_mStep++;
	}, beat * 1000);
}
function nextTrack() {
	G.track = ((G.track || 0) + 1) % TRACKS.length;
	G.save();
	_mStep = 0;
	G.musicOn = true;
	startMusic();
	return curTrack().name;
}

/* ── town ── */
const ROAD = 150,
	BLOCK = 440,
	COLS = 4,
	ROWS = 4;
const WORLD = COLS * BLOCK + (COLS + 1) * ROAD;
function blockOrigin(c, r) {
	return { x: ROAD + c * (BLOCK + ROAD), y: ROAD + r * (BLOCK + ROAD) };
}
function buildTown() {
	const houses = [],
		trees = [],
		parks = [];
	let depot = null,
		hi = 0;
	const special = {
		"1,1": "depot",
		"2,2": "park",
		"3,0": "pond",
		"0,3": "play",
	};
	for (let r = 0; r < ROWS; r++)
		for (let c = 0; c < COLS; c++) {
			const o = blockOrigin(c, r),
				cx = o.x + BLOCK / 2,
				cy = o.y + BLOCK / 2,
				key = c + "," + r,
				sp = special[key];
			if (sp === "depot") {
				depot = { x: cx, y: cy, w: 240, h: 200, door: { x: cx, y: cy + 118 } };
			} else if (sp) {
				parks.push({ x: cx, y: cy, type: sp });
			} else if (hi < HOUSE_DEFS.length) {
				const d = HOUSE_DEFS[hi++],
					hw = 190,
					hh = 170;
				houses.push({
					...d,
					x: cx,
					y: cy,
					w: hw,
					h: hh,
					door: { x: cx, y: cy + hh / 2 + 24 },
					delivered: false,
				});
			}
			const pad = 50;
			[
				[o.x + pad, o.y + pad],
				[o.x + BLOCK - pad, o.y + pad],
				[o.x + pad, o.y + BLOCK - pad],
				[o.x + BLOCK - pad, o.y + BLOCK - pad],
			].forEach((p, i) => {
				if ((i + r + c) % 2 === 0 && sp !== "pond")
					trees.push({
						x: p[0],
						y: p[1],
						s: 0.85 + ((i * 7 + r * 3 + c) % 5) * 0.07,
					});
			});
		}
	return { houses, depot, parks, trees };
}

/* ── road network (for routing + breadcrumb trail) ── */
function roadX(i) {
	return i * (BLOCK + ROAD) + ROAD / 2;
}
function roadY(j) {
	return j * (BLOCK + ROAD) + ROAD / 2;
}
function nearI(x) {
	return Phaser.Math.Clamp(
		Math.round((x - ROAD / 2) / (BLOCK + ROAD)),
		0,
		COLS,
	);
}
function nearJ(y) {
	return Phaser.Math.Clamp(
		Math.round((y - ROAD / 2) / (BLOCK + ROAD)),
		0,
		ROWS,
	);
}
function onRoad(x, y) {
	const ix = nearI(x);
	if (Math.abs(x - roadX(ix)) <= ROAD / 2 + 8) return true;
	const jy = nearJ(y);
	if (Math.abs(y - roadY(jy)) <= ROAD / 2 + 8) return true;
	return false;
}
/* Manhattan road route from (fx,fy) to (tx,ty) — stays on streets, no backtracking */
function roadRoute(fx, fy, tx, ty) {
	const SVi = nearI(fx),
		SHj = nearJ(fy);
	const startV = Math.abs(fx - roadX(SVi)) <= Math.abs(fy - roadY(SHj)); // van nearest a vertical road?
	const TVi = nearI(tx),
		THj = nearJ(ty);
	const targV = Math.abs(tx - roadX(TVi)) <= Math.abs(ty - roadY(THj)); // target nearest a vertical road?
	// entry point: snap onto the nearest road, keeping our position along it
	const ax = startV ? roadX(SVi) : fx,
		ay = startV ? fy : roadY(SHj);
	// exit point: road point closest to the target
	const bx = targV ? roadX(TVi) : tx,
		by = targV ? ty : roadY(THj);
	const pts = [{ x: ax, y: ay }];
	if (startV && targV) {
		if (SVi !== TVi) {
			const cy = roadY(nearJ((fy + ty) / 2));
			pts.push({ x: ax, y: cy }, { x: bx, y: cy });
		}
	} else if (startV && !targV) {
		pts.push({ x: ax, y: by }); // corner: down our column to target's row
	} else if (!startV && targV) {
		pts.push({ x: bx, y: ay }); // corner: across our row to target's column
	} else {
		// both horizontal
		if (SHj !== THj) {
			const cx = roadX(nearI((fx + tx) / 2));
			pts.push({ x: cx, y: ay }, { x: cx, y: by });
		}
	}
	pts.push({ x: bx, y: by }, { x: tx, y: ty });
	const out = [];
	for (const p of pts) {
		const last = out[out.length - 1];
		if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 14) out.push(p);
	}
	return out;
}

/* ── helpers ── */
function fz(r) {
	return Math.floor(Math.min(GW, GH) * r) + "px";
}
function shade(hex, amt) {
	let r = (hex >> 16) & 255,
		g = (hex >> 8) & 255,
		b = hex & 255;
	r = Phaser.Math.Clamp(r + amt, 0, 255);
	g = Phaser.Math.Clamp(g + amt, 0, 255);
	b = Phaser.Math.Clamp(b + amt, 0, 255);
	return (r << 16) | (g << 8) | b;
}
function desat(hex) {
	let r = (hex >> 16) & 255,
		g = (hex >> 8) & 255,
		b = hex & 255;
	const a = (r + g + b) / 3;
	r = (r + a * 2.4) / 3.4;
	g = (g + a * 2.4) / 3.4;
	b = (b + a * 2.4) / 3.4;
	return ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
}

/* draw a van shape into graphics g, centered at (cx,cy), pointing UP */
function drawVanShape(g, cx, cy, v) {
	const s = v.scale || 1,
		w = 34 * s,
		l = 56 * s,
		col = v.color;
	g.fillStyle(0x000000, 0.16).fillEllipse(cx, cy + l / 2 - 2, w * 1.05, 12 * s);
	g.fillStyle(col, 1).fillRoundedRect(cx - w / 2, cy - l / 2, w, l, 11 * s);
	g.fillStyle(shade(col, 26), 1).fillRoundedRect(
		cx - w / 2 + 3,
		cy - l / 2 + 3,
		w - 6,
		l * 0.4,
		8 * s,
	);
	if (v.rainbow) {
		const cols = [0xff6eb4, 0xff9a3c, 0xffe14d, 0x5dffb0, 0x5bc8ff, 0xc77dff];
		cols.forEach((rc, i) => {
			g.fillStyle(rc, 0.9).fillRect(
				cx - w / 2,
				cy - l / 2 + l * 0.42 + i * (l * 0.085),
				w,
				l * 0.085,
			);
		});
	}
	if (v.checker) {
		g.fillStyle(0x222222, 1);
		for (let i = 0; i < 5; i++)
			g.fillRect(cx - w / 2 + i * (w / 5), cy + (i % 2 ? 2 : -6), w / 5, 6);
	}
	if (v.swirl) {
		g.fillStyle(0xffffff, 0.95).fillCircle(cx, cy - l * 0.18, w * 0.22);
		g.fillStyle(0xff8fc6, 1).fillCircle(cx, cy - l * 0.18, w * 0.1);
	}
	if (v.mail) {
		// delivery van: white roof panel + envelope emblem
		g.fillStyle(0xffffff, 1).fillRoundedRect(
			cx - w * 0.33,
			cy - l * 0.02,
			w * 0.66,
			l * 0.34,
			5 * s,
		);
		const ew = w * 0.46,
			eh = l * 0.17,
			ey = cy + l * 0.12;
		g.fillStyle(0xfff3c0, 1).fillRoundedRect(
			cx - ew / 2,
			ey - eh / 2,
			ew,
			eh,
			3 * s,
		);
		g.fillStyle(shade(col, -30), 1).fillTriangle(
			cx - ew / 2,
			ey - eh / 2,
			cx + ew / 2,
			ey - eh / 2,
			cx,
			ey + eh * 0.18,
		);
	}
	g.fillStyle(0xbfeaff, 1).fillRoundedRect(
		cx - w / 2 + 5,
		cy - l / 2 + 6,
		w - 10,
		l * 0.18,
		5 * s,
	); // windshield
	g.fillStyle(0xfff7c2, 1)
		.fillCircle(cx - w / 2 + 6, cy - l / 2 + 4, 3 * s)
		.fillCircle(cx + w / 2 - 6, cy - l / 2 + 4, 3 * s); // headlights (front)
	g.fillStyle(0xff4d4d, 1)
		.fillCircle(cx - w / 2 + 6, cy + l / 2 - 4, 2.6 * s)
		.fillCircle(cx + w / 2 - 6, cy + l / 2 - 4, 2.6 * s); // taillights (back)
	g.fillStyle(0x26203a, 1);
	g.fillRoundedRect(
		cx - w / 2 - 3,
		cy - l / 2 + 11,
		4 * s,
		12 * s,
		2,
	).fillRoundedRect(cx + w / 2 - 1, cy - l / 2 + 11, 4 * s, 12 * s, 2);
	g.fillRoundedRect(
		cx - w / 2 - 3,
		cy + l / 2 - 23,
		4 * s,
		12 * s,
		2,
	).fillRoundedRect(cx + w / 2 - 1, cy + l / 2 - 23, 4 * s, 12 * s, 2);
}
function vanTextureKey(v) {
	return "van-" + v.id;
}
function ensureVanTexture(scene, v) {
	const key = vanTextureKey(v);
	if (scene.textures.exists(key)) return key;
	const s = v.scale || 1,
		tw = Math.ceil(34 * s + 10),
		th = Math.ceil(56 * s + 14);
	const g = scene.make.graphics({ x: 0, y: 0, add: false });
	drawVanShape(g, tw / 2, th / 2, v);
	g.generateTexture(key, tw, th);
	g.destroy();
	return key;
}

/* ═══════════ MENU ═══════════ */
class MenuScene extends Phaser.Scene {
	constructor() {
		super("Menu");
	}
	create() {
		G.load();
		const cx = GW / 2;
		this.cameras.main.setBackgroundColor("#0f0a1e");
		this.add.rectangle(cx, GH * 0.82, GW, GH * 0.42, C.grass, 0.16);
		const v = this.add
			.text(cx, GH * 0.19, "🚐", { fontSize: fz(0.13) })
			.setOrigin(0.5);
		this.tweens.add({
			targets: v,
			y: GH * 0.19 - 16,
			duration: 1300,
			yoyo: true,
			repeat: -1,
			ease: "Sine.inOut",
		});
		this.tweens.add({
			targets: v,
			angle: -6,
			duration: 1300,
			yoyo: true,
			repeat: -1,
			ease: "Sine.inOut",
		});
		this.add
			.text(cx, GH * 0.345, "Maya's Delivery", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.072),
				color: HX.pink,
				stroke: "#0f0a1e",
				strokeThickness: 6,
			})
			.setOrigin(0.5);
		this.add
			.text(cx, GH * 0.345 + Math.min(GW, GH) * 0.078, "Service", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.072),
				color: HX.yellow,
				stroke: "#0f0a1e",
				strokeThickness: 6,
			})
			.setOrigin(0.5);
		// coins + best
		this.add
			.text(cx, GH * 0.52, "🪙 " + G.coins + "    ⭐ Best: " + G.bestStars, {
				fontFamily: "Fredoka One",
				fontSize: fz(0.032),
				color: HX.yellow,
			})
			.setOrigin(0.5);
		// buttons
		makeBtn(
			this,
			cx,
			GH * 0.66,
			"Start Driving!  🚐",
			C.pink,
			"#ffffff",
			fz(0.042),
			() => {
				resumeAudio();
				startMusic();
				this.scene.start("Play");
			},
			C.purple,
		);
		makeBtn(
			this,
			cx,
			GH * 0.78,
			"🚙  Garage",
			C.card,
			HX.text,
			fz(0.036),
			() => {
				resumeAudio();
				this.scene.start("Garage");
			},
			C.cardB,
		);
		const lc = (G.lettersSeen || []).length;
		makeBtn(
			this,
			cx,
			GH * 0.88,
			"📖  Letters  " + lc + "/" + DAD_NOTES.length,
			C.card,
			HX.text,
			fz(0.034),
			() => {
				resumeAudio();
				this.scene.start("Scrapbook");
			},
			C.cardB,
		);
		// sound/music toggles
		this.t1 = this.add
			.text(GW - 20, 20, G.soundOn ? "🔊" : "🔇", { fontSize: fz(0.04) })
			.setOrigin(1, 0)
			.setInteractive({ useHandCursor: true });
		this.t1.on("pointerdown", () => {
			G.soundOn = !G.soundOn;
			G.save();
			this.t1.setText(G.soundOn ? "🔊" : "🔇");
		});
		this.t2 = this.add
			.text(GW - 20, 20 + Math.min(GW, GH) * 0.06, G.musicOn ? "🎵" : "🔈", {
				fontSize: fz(0.04),
			})
			.setOrigin(1, 0)
			.setInteractive({ useHandCursor: true });
		this.t2.on("pointerdown", () => {
			G.musicOn = !G.musicOn;
			G.save();
			this.t2.setText(G.musicOn ? "🎵" : "🔈");
			if (G.musicOn) startMusic();
		});
		this.t3 = this.add
			.text(GW - 20, 20 + Math.min(GW, GH) * 0.12, "⛶", {
				fontSize: fz(0.04),
				color: HX.text,
			})
			.setOrigin(1, 0)
			.setInteractive({ useHandCursor: true });
		this.t3.on("pointerdown", () => {
			toggleFullscreen();
		});
	}
}

/* ═══════════ GARAGE ═══════════ */
class GarageScene extends Phaser.Scene {
	constructor() {
		super("Garage");
	}
	create() {
		const cx = GW / 2;
		this.cameras.main.setBackgroundColor("#0f0a1e");
		this.add
			.text(cx, GH * 0.07, "🚙 Garage", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.06),
				color: HX.blue,
				stroke: "#0f0a1e",
				strokeThickness: 5,
			})
			.setOrigin(0.5);
		this.coinTxt = this.add
			.text(cx, GH * 0.135, "🪙 " + G.coins + " coins", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.034),
				color: HX.yellow,
			})
			.setOrigin(0.5);
		makeBtn(
			this,
			GW * 0.5,
			GH * 0.93,
			"← Back",
			C.card,
			HX.text,
			fz(0.034),
			() => this.scene.start("Menu"),
			C.cardB,
		);

		this.add
			.text(GW * 0.06, GH * 0.2, "VEHICLES", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.03),
				color: HX.pink,
			})
			.setOrigin(0, 0.5);
		this.add
			.text(GW * 0.06, GH * 0.555, "PETS", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.03),
				color: HX.green,
			})
			.setOrigin(0, 0.5);
		this.cards = [];
		this.layoutRow(VEHICLES, GH * 0.36, "V");
		this.layoutRow(PETS, GH * 0.72, "P");
	}
	layoutRow(items, cy, kind) {
		const n = items.length,
			gapPad = GW * 0.05;
		const cw = Math.min((GW - gapPad * 2) / n - 10, GW * 0.16),
			ch = cw * 1.15;
		const totalW = n * cw + (n - 1) * 12,
			x0 = cx0(GW, totalW) + cw / 2;
		items.forEach((it, i) => {
			this.makeCard(it, kind, x0 + i * (cw + 12), cy, cw, ch);
		});
	}
	makeCard(it, kind, x, y, w, h) {
		const owned = (kind === "V" ? G.ownedV : G.ownedP).includes(it.id);
		const equipped = (kind === "V" ? G.vehicle : G.pet) === it.id;
		const g = this.add.graphics();
		const drawCard = () => {
			g.clear();
			g.fillStyle(equipped ? C.card : 0x171030, 0.96).fillRoundedRect(
				x - w / 2,
				y - h / 2,
				w,
				h,
				16,
			);
			g.lineStyle(
				equipped ? 3 : 2,
				equipped ? C.green : C.cardB,
				1,
			).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
		};
		drawCard();
		// preview
		if (kind === "V") {
			const vg = this.add.graphics();
			drawVanShape(vg, x, y - h * 0.16, {
				...it,
				scale: (it.scale || 1) * 0.9,
			});
		} else {
			this.add
				.text(x, y - h * 0.16, it.emoji, {
					fontSize: Math.floor(w * 0.42) + "px",
				})
				.setOrigin(0.5);
		}
		this.add
			.text(x, y + h * 0.16, it.name, {
				fontFamily: "Fredoka One",
				fontSize: Math.max(11, Math.floor(w * 0.115)) + "px",
				color: HX.text,
			})
			.setOrigin(0.5);
		const status = this.add
			.text(
				x,
				y + h * 0.36,
				equipped ? "✓ Driving" : owned ? "Tap to use" : "🪙 " + it.cost,
				{
					fontFamily: "Nunito",
					fontStyle: "900",
					fontSize: Math.max(10, Math.floor(w * 0.1)) + "px",
					color: equipped ? HX.green : owned ? HX.blue : HX.yellow,
				},
			)
			.setOrigin(0.5);
		const hit = this.add
			.rectangle(x, y, w, h, 0xffffff, 0.001)
			.setInteractive({ useHandCursor: true });
		hit.on("pointerdown", () => {
			resumeAudio();
			const ownedNow = (kind === "V" ? G.ownedV : G.ownedP).includes(it.id);
			if (ownedNow) {
				if (kind === "V") G.vehicle = it.id;
				else G.pet = it.id;
				G.save();
				sfx.coin();
				this.scene.restart();
			} else if (G.coins >= it.cost) {
				G.coins -= it.cost;
				(kind === "V" ? G.ownedV : G.ownedP).push(it.id);
				if (kind === "V") G.vehicle = it.id;
				else G.pet = it.id;
				G.save();
				sfx.buy();
				this.confetti(x, y);
				this.scene.restart();
			} else {
				sfx.deny();
				this.cameras.main.shake(180, 0.006);
				this.flashNeed();
			}
		});
	}
	flashNeed() {
		if (this._nf) this._nf.destroy();
		this._nf = this.add
			.text(GW / 2, GH * 0.155, "Not enough coins — go earn some! 🪙", {
				fontFamily: "Nunito",
				fontStyle: "900",
				fontSize: fz(0.026),
				color: HX.pink,
			})
			.setOrigin(0.5);
		this.tweens.add({
			targets: this._nf,
			alpha: 0,
			delay: 1100,
			duration: 600,
			onComplete: () => {
				this._nf && this._nf.destroy();
				this._nf = null;
			},
		});
	}
	confetti(x, y) {
		const cols = [C.pink, C.yellow, C.green, C.blue, C.purple];
		for (let i = 0; i < 18; i++) {
			const r = this.add.rectangle(
				x,
				y,
				7,
				7,
				Phaser.Utils.Array.GetRandom(cols),
			);
			const a = Math.random() * Math.PI * 2,
				d = 40 + Math.random() * 90;
			this.tweens.add({
				targets: r,
				x: x + Math.cos(a) * d,
				y: y + Math.sin(a) * d,
				alpha: 0,
				angle: 360,
				duration: 700,
				onComplete: () => r.destroy(),
			});
		}
	}
}
function cx0(total, w) {
	return (total - w) / 2;
}

/* ═══════════ PLAY ═══════════ */
class PlayScene extends Phaser.Scene {
	constructor() {
		super("Play");
	}
	create(data) {
		const R = data && data.resume ? data : null;
		G.delivered = 0;
		G.tipsEarned = 0;
		const t = buildTown();
		this.houses = t.houses;
		this.depot = t.depot;
		this.parks = t.parks;
		this.trees = t.trees;
		// choose a route of 8 houses (or restore it on a resize-resume)
		if (R) {
			this.route = R.routeIdxs.map((i) => this.houses[i]);
			R.deliveredIdxs.forEach((i) => {
				this.houses[i].delivered = true;
			});
			G.delivered = R.deliveredIdxs.length;
		} else {
			this.route = Phaser.Utils.Array.Shuffle(this.houses.slice()).slice(0, 8);
		}
		G.total = this.route.length;
		this.routeIdx = R ? R.routeIdx : 0;
		// make the 4th delivery a Letter from Dad
		this.dadIdx = 3;
		this.theme = R ? R.theme || "normal" : chooseTheme();
		this.partyGuests = [];
		this.sender = null;
		this.ctl = { left: false, right: false, gas: false, rev: false };
		this.heading = R ? R.heading : -Math.PI / 2;
		this.speed = 0;
		this.carrying = R ? R.carrying : false;
		this.driving = false;
		this.target = null;
		this.drag = { active: false, id: null, ox: 0, oy: 0, ang: 0, mag: 0 };
		this.boostT = 0;
		this.turbo = 1;
		this.dayPhase = R ? R.dayPhase : 0;
		this.cleanRun = true;
		this.pkgType = R ? R.pkgType : "normal";
		this.pizzaT = R ? R.pizzaT : 0;
		this.t0 = 0;
		this.pickupTime = this.time.now;
		this.rainOn = R ? R.rainOn : false;
		this.smashCount = R ? R.smashCount : 0;
		this.honkNeeded = R ? R.honkNeeded : false;
		this.awoken = R ? R.awoken : false;

		this.physics.world.setBounds(0, 0, WORLD, WORLD);
		this.cameras.main.setBounds(0, 0, WORLD, WORLD);
		this.cameras.main.setBackgroundColor("#86d36b");

		this.drawGround();
		this.drawParks();
		this.drawTrees();
		this.spawnCoins();
		this.spawnBoostPads();
		this.spawnWanderers();
		this.spawnProps();
		this.spawnCrossings();
		this.trailG = this.add.graphics().setDepth(1);
		this.glow = this.add.ellipse(0, 0, 10, 10, C.white, 0.4).setVisible(false);
		this.houses.forEach((h) => {
			h.gfx = this.add.graphics();
			h.label = this.add
				.text(0, 0, h.emoji, { fontSize: "30px" })
				.setOrigin(0.5);
			this.drawHouse(h);
		});
		this.drawDepot();

		const veh = G.veh();
		const key = ensureVanTexture(this, veh);
		this.headG = this.add.graphics(); // headlights (below van)
		const vsx = R ? R.vanx : this.depot.door.x,
			vsy = R ? R.vany : this.depot.door.y + 34;
		this.van = this.physics.add.image(vsx, vsy, key);
		this.van.setCollideWorldBounds(true);
		const s = veh.scale || 1;
		this.van.body.setCircle(15 * s);
		this.van.body.setOffset(
			this.van.width / 2 - 15 * s,
			this.van.height / 2 - 15 * s,
		);
		this.van.setRotation(this.heading + Math.PI / 2);
		// colliders
		const walls = [
			...this.houses.map((h) => ({
				x: h.x,
				y: h.y + 18,
				w: h.w * 0.9,
				h: h.h * 0.78,
			})),
			{
				x: this.depot.x,
				y: this.depot.y + 14,
				w: this.depot.w,
				h: this.depot.h * 0.8,
			},
		];
		walls.forEach((w) => {
			const rect = this.add.rectangle(w.x, w.y, w.w, w.h, 0xff0000, 0);
			this.physics.add.existing(rect, true);
			this.physics.add.collider(this.van, rect, () => {
				if (this.speed > 260) this.cleanRun = false;
			});
		});
		this.pkgIcon = this.add
			.text(0, 0, "📦", { fontSize: "20px" })
			.setOrigin(0.5)
			.setVisible(false);
		// pet rides along
		this.petIcon = this.add
			.text(0, 0, G.petDef().emoji, { fontSize: "20px" })
			.setOrigin(0.5);
		this.cameras.main.startFollow(this.van, true, 0.09, 0.09);

		// night overlay + rain (screen fixed)
		this.night = this.add
			.rectangle(GW / 2, GH / 2, GW, GH, 0x0a1230, 0)
			.setScrollFactor(0)
			.setDepth(1200);
		if (R)
			this.night.setFillStyle(0x0a1230, Math.min(0.5, this.dayPhase * 0.55));
		this.rainG = this.add.graphics().setScrollFactor(0).setDepth(1205);
		this.rain = [];

		this.buildHUD();
		this.buildControls();
		this.bindKeys();
		this.bindDrag();
		if (R) {
			// resuming after a screen resize — skip the intro, restore the run
			this.driving = true;
			this.houses.forEach((h) => {
				if (h.delivered) this.drawHouse(h);
			});
			if (this.carrying && this.routeIdx < this.route.length) {
				this.target = this.route[this.routeIdx];
				this.pkgIcon.setVisible(true).setText(R.pkgEmoji || "📦");
				this.glow.setVisible(true).setFillStyle(this.target.hex, 0.5);
				this.banner.setVisible(true);
				this.bannerLabel.setText(R.bannerLabel || "📦 Deliver to");
				this.bannerTxt.setText(this.target.name + " " + this.target.emoji);
				this.updateHUD();
			} else if (this.routeIdx < this.route.length) {
				this.pickTarget(); // resized between drops — grab the next package
			}
		} else {
			// intro kid
			this.kid = this.add
				.text(this.depot.x, this.depot.y + 34, "🧒", { fontSize: "36px" })
				.setOrigin(0.5, 0.7);
			this.kidPkg = this.add
				.text(0, 0, "📦", { fontSize: "20px" })
				.setVisible(false);
			this.runIntro();
			this.skipHint = this.add
				.text(GW / 2, GH - 40, "tap to skip ›", {
					fontFamily: "Nunito",
					fontSize: fz(0.026),
					color: "#ffffff",
				})
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(2000);
			this.tweens.add({
				targets: this.skipHint,
				alpha: 0.4,
				duration: 700,
				yoyo: true,
				repeat: -1,
			});
		}
	}
	snapshot() {
		return {
			resume: true,
			routeIdxs: this.route.map((h) => this.houses.indexOf(h)),
			deliveredIdxs: this.houses
				.map((h, i) => (h.delivered ? i : -1))
				.filter((i) => i >= 0),
			routeIdx: this.routeIdx,
			carrying: this.carrying,
			pkgType: this.pkgType,
			pkgEmoji: this.pkgIcon && this.pkgIcon.text,
			bannerLabel: this.bannerLabel && this.bannerLabel.text,
			honkNeeded: this.honkNeeded,
			awoken: this.awoken,
			dayPhase: this.dayPhase,
			rainOn: this.rainOn,
			pizzaT: this.pizzaT,
			smashCount: this.smashCount || 0,
			theme: this.theme,
			vanx: this.van.x,
			vany: this.van.y,
			heading: this.heading,
		};
	}

	/* ── world drawing ── */
	drawGround() {
		const g = this.add.graphics().setDepth(-100);
		g.fillStyle(C.grass, 1).fillRect(0, 0, WORLD, WORLD);
		g.fillStyle(C.grassD, 0.5);
		const s = BLOCK + ROAD;
		for (let x = 0; x < WORLD; x += s)
			for (let y = 0; y < WORLD; y += s) g.fillRect(x, y, s / 2, s / 2);
		g.fillStyle(C.road, 1);
		for (let i = 0; i <= COLS; i++)
			g.fillRect(i * (BLOCK + ROAD), 0, ROAD, WORLD);
		for (let i = 0; i <= ROWS; i++)
			g.fillRect(0, i * (BLOCK + ROAD), WORLD, ROAD);
		g.fillStyle(C.yellow, 0.85);
		const dash = 26,
			gap = 22;
		for (let i = 0; i <= COLS; i++) {
			const x = i * (BLOCK + ROAD) + ROAD / 2 - 2.5;
			for (let y = 8; y < WORLD; y += dash + gap)
				g.fillRoundedRect(x, y, 5, dash, 2.5);
		}
		for (let i = 0; i <= ROWS; i++) {
			const y = i * (BLOCK + ROAD) + ROAD / 2 - 2.5;
			for (let x = 8; x < WORLD; x += dash + gap)
				g.fillRoundedRect(x, y, dash, 5, 2.5);
		}
	}
	drawParks() {
		this.parks.forEach((p) => {
			const g = this.add.graphics().setDepth(p.y - 50);
			if (p.type === "pond" || p.type === "park") {
				g.fillStyle(0x4fb0d8, 1).fillEllipse(p.x, p.y, 260, 180);
				g.fillStyle(C.water, 1).fillEllipse(p.x, p.y, 236, 160);
				g.fillStyle(0xffffff, 0.18).fillEllipse(p.x - 40, p.y - 30, 80, 30);
				this.add
					.text(p.x - 50, p.y - 10, "🦆", { fontSize: "30px" })
					.setOrigin(0.5)
					.setDepth(p.y);
				this.add
					.text(p.x + 44, p.y + 16, "🦢", { fontSize: "30px" })
					.setOrigin(0.5)
					.setDepth(p.y);
				this.add
					.text(p.x + 10, p.y - 44, "🪷", { fontSize: "24px" })
					.setOrigin(0.5)
					.setDepth(p.y);
			}
			if (p.type === "play" || p.type === "park") {
				const ox = p.type === "park" ? p.x + 120 : p.x;
				this.add
					.text(ox, p.y - 110, "🛝", { fontSize: "46px" })
					.setOrigin(0.5)
					.setDepth(p.y);
				this.add
					.text(ox - 70, p.y - 90, "🌷", { fontSize: "28px" })
					.setOrigin(0.5)
					.setDepth(p.y);
				this.add
					.text(ox + 70, p.y - 70, "🌻", { fontSize: "28px" })
					.setOrigin(0.5)
					.setDepth(p.y);
				this.add
					.text(ox, p.y + 60, "🪁", { fontSize: "30px" })
					.setOrigin(0.5)
					.setDepth(p.y);
			}
		});
	}
	drawTrees() {
		this.trees.forEach((t) => {
			const g = this.add.graphics().setDepth(t.y);
			const r = 26 * t.s;
			g.fillStyle(0x000000, 0.16).fillEllipse(
				t.x,
				t.y + r * 0.7,
				r * 1.8,
				r * 0.8,
			);
			g.fillStyle(0x7a4a2b, 1).fillRect(t.x - 4 * t.s, t.y, 8 * t.s, r * 0.7);
			g.fillStyle(0x3fae5a, 1).fillCircle(t.x, t.y - r * 0.2, r);
			g.fillStyle(0x52c46c, 1)
				.fillCircle(t.x - r * 0.4, t.y - r * 0.4, r * 0.6)
				.fillCircle(t.x + r * 0.4, t.y - r * 0.3, r * 0.55);
		});
	}
	drawHouse(h) {
		const g = h.gfx;
		g.clear();
		g.setDepth(h.y);
		const w = h.w,
			hh = h.h,
			x = h.x,
			y = h.y,
			body = h.delivered ? desat(h.hex) : h.hex;
		g.fillStyle(0x000000, 0.18).fillEllipse(x, y + hh / 2 + 6, w * 1.05, 30);
		g.fillStyle(body, 1).fillRoundedRect(
			x - w / 2,
			y - hh / 2 + 34,
			w,
			hh - 34,
			14,
		);
		g.fillStyle(shade(body, -32), 1).fillTriangle(
			x - w / 2 - 10,
			y - hh / 2 + 40,
			x,
			y - hh / 2 - 22,
			x + w / 2 + 10,
			y - hh / 2 + 40,
		);
		g.fillStyle(shade(body, -52), 1).fillRoundedRect(
			x - 26,
			y + hh / 2 - 58,
			52,
			58,
			10,
		);
		g.fillStyle(0xffffff, 0.85)
			.fillRoundedRect(x + w / 2 - 58, y - 12, 38, 38, 8)
			.fillRoundedRect(x - w / 2 + 20, y - 12, 38, 38, 8);
		h.label.setPosition(x, y - hh / 2 + 12).setDepth(h.y);
		if (h.delivered && !h.check)
			h.check = this.add
				.text(x + w / 2 - 8, y - hh / 2, "✅", { fontSize: "30px" })
				.setOrigin(0.5)
				.setDepth(h.y + 1);
	}
	drawDepot() {
		const d = this.depot,
			g = this.add.graphics().setDepth(d.y),
			x = d.x,
			y = d.y,
			w = d.w,
			hh = d.h;
		g.fillStyle(0x000000, 0.2).fillEllipse(x, y + hh / 2 + 8, w * 1.1, 38);
		g.fillStyle(C.purple, 1).fillRoundedRect(
			x - w / 2,
			y - hh / 2 + 30,
			w,
			hh - 30,
			16,
		);
		g.fillStyle(0xa85fe0, 1).fillTriangle(
			x - w / 2 - 12,
			y - hh / 2 + 36,
			x,
			y - hh / 2 - 26,
			x + w / 2 + 12,
			y - hh / 2 + 36,
		);
		g.fillStyle(C.yellow, 1).fillRoundedRect(x - 90, y - 20, 180, 42, 10);
		g.fillStyle(0x7a3fb0, 1).fillRoundedRect(
			x - 30,
			y + hh / 2 - 66,
			60,
			66,
			10,
		);
		this.add
			.text(x, y + 1, "DAD'S POST OFFICE", {
				fontFamily: "Nunito",
				fontStyle: "900",
				fontSize: "15px",
				color: "#3a1d5c",
			})
			.setOrigin(0.5)
			.setDepth(d.y);
		this.add
			.text(x, y - hh / 2 + 10, "📮", { fontSize: "34px" })
			.setOrigin(0.5)
			.setDepth(d.y);
	}
	spawnCoins() {
		this.coins = [];
		const tries = 80;
		let placed = 0;
		for (let i = 0; i < tries && placed < 26; i++) {
			const onX = Math.random() < 0.5;
			let x, y;
			if (onX) {
				const band = Phaser.Math.Between(0, COLS);
				x = band * (BLOCK + ROAD) + ROAD / 2;
				y = Phaser.Math.Between(ROAD, WORLD - ROAD);
			} else {
				const band = Phaser.Math.Between(0, ROWS);
				y = band * (BLOCK + ROAD) + ROAD / 2;
				x = Phaser.Math.Between(ROAD, WORLD - ROAD);
			}
			if (Phaser.Math.Distance.Between(x, y, this.depot.x, this.depot.y) < 160)
				continue;
			const c = this.add
				.text(x, y, "🪙", { fontSize: "26px" })
				.setOrigin(0.5)
				.setDepth(y);
			this.tweens.add({
				targets: c,
				y: y - 6,
				duration: 600,
				yoyo: true,
				repeat: -1,
				ease: "Sine.inOut",
			});
			this.coins.push(c);
			placed++;
		}
	}
	spawnBoostPads() {
		this.pads = [];
		const spots = [
			[ROAD / 2, WORLD * 0.35, Math.PI / 2],
			[WORLD - ROAD / 2, WORLD * 0.6, -Math.PI / 2],
			[WORLD * 0.4, ROAD / 2, 0],
			[WORLD * 0.7, WORLD - ROAD / 2, Math.PI],
			[WORLD * 0.55, 2 * (BLOCK + ROAD) + ROAD / 2, 0],
			[2 * (BLOCK + ROAD) + ROAD / 2, WORLD * 0.78, -Math.PI / 2],
		];
		spots.forEach((s) => {
			const g = this.add.graphics().setDepth(2);
			g.setPosition(s[0], s[1]);
			g.setRotation(s[2]);
			for (let i = 0; i < 3; i++) {
				g.fillStyle(C.green, 0.5 + i * 0.16);
				g.fillTriangle(
					-22,
					-16 + i * 16 - 16,
					22,
					0 + i * 16 - 16,
					-22,
					16 + i * 16 - 16,
				);
			} // chevrons
			this.pads.push({ x: s[0], y: s[1], ang: s[2] });
		});
	}
	spawnProps() {
		// smashable street props — drive through them for chaos!
		this.props = [];
		this.smashCount = 0;
		const KINDS = ["🚧", "🗑️", "📫", "🛢️", "⛄", "🌷", "🪧", "🛒", "🧺", "🪣"];
		const tries = 160;
		let placed = 0;
		for (let i = 0; i < tries && placed < 34; i++) {
			const onX = Math.random() < 0.5;
			let x, y;
			if (onX) {
				const band = Phaser.Math.Between(0, COLS);
				x = roadX(band) + Phaser.Math.Between(-ROAD / 2 + 22, ROAD / 2 - 22);
				y = Phaser.Math.Between(ROAD, WORLD - ROAD);
			} else {
				const band = Phaser.Math.Between(0, ROWS);
				y = roadY(band) + Phaser.Math.Between(-ROAD / 2 + 22, ROAD / 2 - 22);
				x = Phaser.Math.Between(ROAD, WORLD - ROAD);
			}
			if (Phaser.Math.Distance.Between(x, y, this.depot.x, this.depot.y) < 170)
				continue;
			if (
				this.props.some(
					(p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 70,
				)
			)
				continue;
			const emoji = Phaser.Utils.Array.GetRandom(KINDS);
			const obj = this.add
				.text(x, y, emoji, { fontSize: "30px" })
				.setOrigin(0.5, 0.7)
				.setDepth(y);
			this.props.push({ x, y, emoji, obj, alive: true });
			placed++;
		}
	}
	smashProp(p) {
		p.alive = false;
		this.smashCount++;
		sfx.bonk();
		this.cameras.main.shake(160, 0.009);
		// the prop itself spins off
		const fly = this.add
			.text(p.x, p.y, p.emoji, { fontSize: "30px" })
			.setOrigin(0.5)
			.setDepth(6000);
		const a = this.heading + (Math.random() - 0.5) * 1.2,
			d = 80 + Math.random() * 120;
		this.tweens.add({
			targets: fly,
			x: p.x + Math.cos(a) * d,
			y: p.y + Math.sin(a) * d,
			angle: Phaser.Math.Between(360, 900),
			alpha: 0,
			scale: 0.5,
			duration: 750,
			ease: "Quad.out",
			onComplete: () => fly.destroy(),
		});
		// debris bits
		const cols = [C.yellow, C.pink, C.green, C.blue, C.orange];
		for (let i = 0; i < 10; i++) {
			const bit = this.add
				.rectangle(p.x, p.y, 6, 6, Phaser.Utils.Array.GetRandom(cols))
				.setDepth(5999);
			const ba = Math.random() * Math.PI * 2,
				bd = 30 + Math.random() * 70;
			this.tweens.add({
				targets: bit,
				x: p.x + Math.cos(ba) * bd,
				y: p.y + Math.sin(ba) * bd,
				alpha: 0,
				angle: 360,
				duration: 550,
				onComplete: () => bit.destroy(),
			});
		}
		p.obj.destroy();
		// funny callout
		this.popText(
			Phaser.Utils.Array.GetRandom([
				"BONK! 💥",
				"CRASH! 💥",
				"Oops! 🙈",
				"WHEE! 💨",
				"SMASH! 💥",
			]),
			C.orange,
			p.x,
			p.y,
		);
		this.speed *= 0.84; // little jolt
	}
	showStopSign(cr) {
		if (!this._stopSign) {
			this._stopSign = this.add
				.text(cr.x, cr.y - 42, "🛑", { fontSize: "42px" })
				.setOrigin(0.5)
				.setDepth(8000);
			this.tweens.add({
				targets: this._stopSign,
				scale: 1.15,
				duration: 380,
				yoyo: true,
				repeat: -1,
				ease: "Sine.inOut",
			});
		} else {
			this._stopSign.setPosition(cr.x, cr.y - 42);
		}
		if (!this._stopTxt) {
			this._stopTxt = this.add
				.text(GW / 2, GH * 0.16, "🛑 STOP — animals crossing!", {
					fontFamily: "Fredoka One",
					fontSize: fz(0.036),
					color: HX.pink,
					stroke: "#3a1d5c",
					strokeThickness: 5,
				})
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(3100);
		}
	}
	splash(x, y, pk) {
		sfx.coin(); // light bloop
		this.actionBanner("SPLASH! 💦", C.blue);
		// water droplets
		for (let i = 0; i < 14; i++) {
			const d = this.add
				.text(x, y, "💧", { fontSize: Phaser.Math.Between(16, 26) + "px" })
				.setOrigin(0.5)
				.setDepth(6500);
			const a = Math.random() * Math.PI * 2,
				dist = 40 + Math.random() * 90;
			this.tweens.add({
				targets: d,
				x: x + Math.cos(a) * dist,
				y: y + Math.sin(a) * dist,
				alpha: 0,
				duration: 600 + Math.random() * 300,
				ease: "Quad.out",
				onComplete: () => d.destroy(),
			});
		}
		// ducks flap away from the van
		for (let i = 0; i < 3; i++) {
			const duck = this.add
				.text(x, y, Phaser.Utils.Array.GetRandom(["🦆", "🦢"]), {
					fontSize: "28px",
				})
				.setOrigin(0.5)
				.setDepth(6500);
			const a = Math.atan2(y - pk.y, x - pk.x) + (Math.random() - 0.5) * 1.4,
				dist = 120 + Math.random() * 90;
			this.tweens.add({
				targets: duck,
				x: x + Math.cos(a) * dist,
				y: y + Math.sin(a) * dist - 30,
				angle: Phaser.Math.Between(-20, 20),
				alpha: 0,
				duration: 900,
				ease: "Quad.out",
				onComplete: () => duck.destroy(),
			});
		}
	}
	spawnCrossings() {
		// zebra crosswalks where animal families cross — you must STOP for them!
		this.crossings = [];
		const CR = [
			{ x: roadX(2), y: roadY(0) + (BLOCK + ROAD) * 0.5, vert: true },
			{ x: roadX(1), y: roadY(2) + (BLOCK + ROAD) * 0.5, vert: true },
			{ x: roadX(0) + (BLOCK + ROAD) * 0.5, y: roadY(1), vert: false },
			{ x: roadX(3), y: roadY(1) + (BLOCK + ROAD) * 0.5, vert: true },
		];
		CR.forEach((c) => {
			const g = this.add.graphics().setDepth(1);
			g.fillStyle(0xffffff, 0.8);
			if (c.vert) {
				for (let i = -2; i <= 2; i++)
					g.fillRect(c.x - ROAD / 2 + 8, c.y + i * 16 - 5, ROAD - 16, 10);
			} else {
				for (let i = -2; i <= 2; i++)
					g.fillRect(c.x + i * 16 - 5, c.y - ROAD / 2 + 8, 10, ROAD - 16);
			}
			this.crossings.push({
				x: c.x,
				y: c.y,
				vert: c.vert,
				active: false,
				timer: Phaser.Math.Between(3, 9),
				animals: [],
				dir: 1,
			});
		});
	}
	updateCrossings(dt) {
		if (!this.crossings) return;
		const ANI = ["🦔", "🐤", "🦆", "🐇", "🐿️", "🐥"];
		this.crossings.forEach((cr) => {
			if (!cr.active) {
				cr.timer -= dt;
				if (cr.timer <= 0) {
					cr.active = true;
					cr.animals = [];
					const n = Phaser.Math.Between(2, 4),
						dir = Math.random() < 0.5 ? 1 : -1,
						e = Phaser.Utils.Array.GetRandom(ANI);
					animalSound(e);
					for (let i = 0; i < n; i++) {
						let ax, ay;
						if (cr.vert) {
							ax = cr.x - dir * (ROAD / 2 + 30) - dir * i * 26;
							ay = cr.y;
						} else {
							ax = cr.x;
							ay = cr.y - dir * (ROAD / 2 + 30) - dir * i * 26;
						}
						const o = this.add
							.text(ax, ay, e, { fontSize: "26px" })
							.setOrigin(0.5)
							.setDepth(cr.y + 20);
						o.setFlipX(cr.vert && dir > 0);
						cr.animals.push({ o });
					}
					cr.dir = dir;
				}
			} else {
				const sp = 66 * dt;
				let allDone = true;
				cr.animals.forEach((a) => {
					if (cr.vert) a.o.x += cr.dir * sp;
					else a.o.y += cr.dir * sp;
					const past = cr.vert
						? cr.dir > 0
							? a.o.x < cr.x + ROAD / 2 + 34
							: a.o.x > cr.x - ROAD / 2 - 34
						: cr.dir > 0
							? a.o.y < cr.y + ROAD / 2 + 34
							: a.o.y > cr.y - ROAD / 2 - 34;
					if (past) allDone = false;
				});
				if (allDone) {
					cr.active = false;
					cr.timer = Phaser.Math.Between(8, 15);
					cr.animals.forEach((a) => a.o.destroy());
					cr.animals = [];
				}
			}
		});
	}
	spawnWanderers() {
		this.wanderers = [];
		const emos = ["🐕", "🐈", "🦆", "🐇", "🐓", "🦢", "🐖", "🐑", "🦃", "🐐"];
		for (let k = 0; k < 9; k++) {
			const i = Phaser.Math.Between(0, COLS),
				j = Phaser.Math.Between(0, ROWS);
			const onV = Math.random() < 0.5;
			const x = onV ? roadX(i) : Phaser.Math.Between(ROAD, WORLD - ROAD);
			const y = onV ? Phaser.Math.Between(ROAD, WORLD - ROAD) : roadY(j);
			const t = this.add
				.text(x, y, Phaser.Utils.Array.GetRandom(emos), { fontSize: "26px" })
				.setOrigin(0.5, 0.8);
			const w = { t, x, y, tx: x, ty: y, spd: Phaser.Math.Between(26, 48) };
			this.pickWander(w);
			this.wanderers.push(w);
		}
	}
	pickWander(w) {
		const i = nearI(w.x),
			j = nearJ(w.y);
		const ni = Phaser.Math.Clamp(i + Phaser.Math.Between(-1, 1), 0, COLS),
			nj = Phaser.Math.Clamp(j + Phaser.Math.Between(-1, 1), 0, ROWS);
		if (Math.random() < 0.5) {
			w.tx = roadX(ni);
			w.ty = roadY(j);
		} else {
			w.tx = roadX(i);
			w.ty = roadY(nj);
		}
	}
	updateWanderers(dt) {
		if (!this.wanderers) return;
		this.wanderers.forEach((w) => {
			const dx = w.tx - w.x,
				dy = w.ty - w.y,
				d = Math.hypot(dx, dy);
			if (d < 6) {
				this.pickWander(w);
			} else {
				w.x += (dx / d) * w.spd * dt;
				w.y += (dy / d) * w.spd * dt;
			}
			w.t
				.setPosition(w.x, w.y + Math.sin(this.time.now / 170 + w.x) * 2)
				.setDepth(w.y);
			w.t.setFlipX(dx < 0);
		});
	}

	/* ── intro ── */
	runIntro() {
		const v = this.van;
		this.petIcon.setPosition(this.kid.x + 18, this.kid.y - 6);
		this.tweens.add({
			targets: this.kid,
			x: v.x - 30,
			y: v.y,
			duration: 1100,
			ease: "Sine.inOut",
			onUpdate: () => {
				this.kid.y = v.y + Math.sin(this.time.now / 60) * 2;
				this.petIcon.setPosition(this.kid.x + 18, this.kid.y - 6);
			},
			onComplete: () => {
				this.kidPkg.setVisible(true).setPosition(this.kid.x, this.kid.y - 26);
				this.tweens.add({
					targets: this.kidPkg,
					x: v.x,
					y: v.y,
					duration: 500,
					ease: "Quad.in",
					onComplete: () => this.kidPkg.setVisible(false),
				});
			},
		});
		this.introTimer = this.time.delayedCall(2050, () => this.startDriving());
	}
	startDriving() {
		if (this.driving) return;
		this.driving = true;
		this.t0 = this.time.now;
		if (this.introTimer) this.introTimer.remove(false);
		this.tweens.killTweensOf(this.kid);
		this.kid.destroy();
		this.kidPkg.destroy();
		this.skipHint.destroy();
		sfx.vroom ? sfx.vroom() : beep(120, 0.18, "sawtooth", 0.07, 180);
		this.pickTarget();
		if (this.theme && this.theme !== "normal") {
			const th = THEMES[this.theme];
			this.time.delayedCall(300, () =>
				this.actionBanner(th.emoji + " " + th.label, C.pink),
			);
		}
		if (!G.hinted) {
			G.hinted = true;
			this.toast("Tap the banner up top — I'll drive there for you! 🚐", 30);
		}
	}

	/* ── delivery loop ── */
	pickTarget() {
		if (this.routeIdx >= this.route.length) {
			this.target = null;
			return;
		}
		this.target = this.route[this.routeIdx];
		this.carrying = true;
		this.pickupTime = this.time.now;
		this.cleanRun = true;
		this.pkgIcon.setVisible(true);
		// package type — flavoured by the day's theme; the 4th stop is always Dad's letter
		const prog = this.routeIdx / this.route.length;
		this.sender = null;
		if (this.routeIdx === this.dadIdx) {
			this.pkgType = "dad";
			this.pkgIcon.setText("💌");
		} else if (this.theme === "party") {
			this.pkgType = "invite";
			this.pkgIcon.setText("🎈");
		} else if (this.theme === "birthday") {
			this.pkgType = "cake";
			this.pkgIcon.setText("🎂");
		} else if (this.theme === "pizza") {
			this.pkgType = "pizza";
			this.pkgIcon.setText("🍕");
			this.pizzaT = 1;
		} else if (Math.random() < 0.32) {
			this.pkgType = "neighbor";
			this.pkgIcon.setText("💌");
			this.sender = Phaser.Utils.Array.GetRandom(
				this.houses.filter((h) => h !== this.target),
			);
		} else {
			const roll = Math.random();
			if (roll < 0.18 + prog * 0.34) {
				this.pkgType = "pizza";
				this.pkgIcon.setText("🍕");
				this.pizzaT = 1;
			} else if (roll < 0.3 + prog * 0.4) {
				this.pkgType = "fragile";
				this.pkgIcon.setText("🥚");
			} else {
				this.pkgType = "normal";
				this.pkgIcon.setText("📦");
			}
		}
		this.glow.setVisible(true).setFillStyle(this.target.hex, 0.5);
		// pull up in front and honk — the animal will come out to your van
		this.atHouse = false;
		this.awoken = false;
		this.delivering = false;
		this.honkNeeded = true;
		this.banner.setVisible(true);
		const label =
			this.pkgType === "dad"
				? "💌 Letter for"
				: this.pkgType === "invite"
					? "🎈 Invite for"
					: this.pkgType === "cake"
						? "🎂 Cake for"
						: this.pkgType === "pizza"
							? "🍕 Hot pizza for"
							: this.pkgType === "fragile"
								? "🥚 Fragile for"
								: this.pkgType === "neighbor"
									? "💌 " + this.sender.emoji + " " + this.sender.name + " →"
									: "📦 Deliver to";
		this.bannerLabel.setText(label);
		this.bannerTxt.setText(this.target.name + " " + this.target.emoji);
		this.updateHUD();
		sfx.pickup();
	}
	deliver(h, cx, cy, animal) {
		if (cx == null) {
			cx = h.door.x;
			cy = h.door.y;
		}
		h.delivered = true;
		G.delivered++;
		this.carrying = false;
		this.pkgIcon.setVisible(false);
		this.atHouse = false;
		this.honkNeeded = false;
		this.delivering = false;
		this.hideHonkPrompt();
		const dt = (this.time.now - this.pickupTime) / 1000;
		const tipWindow = 14 - this.dayPhase * 7;
		let tip = 15,
			msg = "Delivered!";
		if (this.pkgType === "dad") {
			tip = 30;
		} else if (this.pkgType === "invite") {
			tip = 20;
			if (this.partyGuests) this.partyGuests.push(this.target.emoji);
		} else if (this.pkgType === "cake") {
			tip = 25;
		} else if (this.pkgType === "neighbor") {
			tip = 28;
		} else if (this.pkgType === "pizza") {
			tip = this.pizzaT > 0.35 ? 35 : 12;
			msg = this.pizzaT > 0.35 ? "Hot & fresh! 🍕" : "A bit cold...";
		} else if (this.pkgType === "fragile") {
			tip = this.cleanRun ? 35 : 10;
			msg = this.cleanRun ? "Handled with care! 🥚" : "Ooof, bumpy ride!";
		} else {
			tip = dt < tipWindow ? 25 : 12;
		}
		G.coins += tip;
		G.tipsEarned += tip;
		G.save();
		this.drawHouse(h);
		this.glow.setVisible(false);
		this.banner.setVisible(false);
		this.happyCustomer(h, cx, cy, animal);
		sfx.deliver();
		this.updateHUD();
		this.flyTip(tip, cx, cy);
		this.routeIdx++;
		// day phase / ramp
		this.dayPhase = this.routeIdx / this.route.length;
		this.tweens.add({
			targets: this.night,
			fillAlpha: Math.min(0.5, this.dayPhase * 0.55),
			duration: 900,
		});
		if (this.dayPhase >= 0.5 && !this.rainOn) {
			this.rainOn = true;
		}
		if (G.delivered >= G.total) {
			G.smashCount = this.smashCount || 0;
			if (this.theme === "party" || this.theme === "birthday") {
				this.time.delayedCall(1100, () => this.partyFinale());
			} else {
				this.time.delayedCall(1500, () => this.scene.start("Win"));
			}
		} else {
			this.time.delayedCall(900, () => this.pickTarget());
		}
	}
	happyCustomer(h, x, y, animal) {
		if (x == null) {
			x = h.door.x;
			y = h.door.y;
		}
		// the animal that came to the van does a happy bounce, then heads home
		if (animal) {
			this.tweens.add({
				targets: animal,
				y: y - 18,
				duration: 200,
				yoyo: true,
				repeat: 2,
				ease: "Quad.out",
				onComplete: () => {
					animal.setFlipX(h.door.x > animal.x);
					this.tweens.add({
						targets: animal,
						x: h.door.x,
						y: h.door.y,
						duration: 600,
						delay: 250,
						ease: "Sine.in",
						onUpdate: () => animal.setDepth(animal.y),
						onComplete: () => {
							this.tweens.add({
								targets: animal,
								alpha: 0,
								duration: 200,
								onComplete: () => animal.destroy(),
							});
						},
					});
				},
			});
		} else {
			const a = this.add
				.text(x, y - 10, h.emoji, { fontSize: "46px" })
				.setOrigin(0.5, 1)
				.setDepth(9500);
			this.tweens.add({
				targets: a,
				y: a.y - 26,
				duration: 260,
				yoyo: true,
				repeat: 2,
				ease: "Quad.out",
			});
			this.time.delayedCall(1700, () => {
				this.tweens.add({
					targets: a,
					y: a.y + 30,
					alpha: 0,
					duration: 300,
					onComplete: () => a.destroy(),
				});
			});
		}
		// hearts pop around the van
		for (let i = 0; i < 8; i++) {
			const e = this.add
				.text(
					x,
					y - 30,
					Phaser.Utils.Array.GetRandom(["❤️", "💕", "✨", "⭐"]),
					{ fontSize: "24px" },
				)
				.setOrigin(0.5)
				.setDepth(9600);
			const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.6,
				d = 50 + Math.random() * 70;
			this.tweens.add({
				targets: e,
				x: x + Math.cos(ang) * d,
				y: y - 30 + Math.sin(ang) * d,
				alpha: 0,
				scale: 0.5,
				duration: 900,
				onComplete: () => e.destroy(),
			});
		}
		// a happy little sound in the animal's own voice 🐾
		this.time.delayedCall(140, () => animalSound(h.emoji));
		// neighbour-to-neighbour mail: the sender peeks in to say hi
		if (this.pkgType === "neighbor" && this.sender) {
			const sp = this.add
				.text(x - 44, y - 44, this.sender.emoji, { fontSize: "34px" })
				.setOrigin(0.5)
				.setDepth(9550)
				.setAlpha(0);
			this.tweens.add({
				targets: sp,
				alpha: 1,
				x: x - 26,
				duration: 300,
				yoyo: true,
				hold: 650,
				onComplete: () => sp.destroy(),
			});
		}
		// rainbow day sparkles
		if (this.theme === "rainbow") {
			for (let i = 0; i < 6; i++) {
				const r = this.add
					.text(x, y - 20, Phaser.Utils.Array.GetRandom(["🌈", "✨", "💖"]), {
						fontSize: "22px",
					})
					.setOrigin(0.5)
					.setDepth(9600);
				const ang = Math.random() * Math.PI * 2,
					d = 40 + Math.random() * 60;
				this.tweens.add({
					targets: r,
					x: x + Math.cos(ang) * d,
					y: y - 20 + Math.sin(ang) * d,
					alpha: 0,
					duration: 1000,
					onComplete: () => r.destroy(),
				});
			}
		}
		// speech: thank you (+ a fun fact on regular deliveries)
		let note,
			scol = C.white;
		if (this.pkgType === "dad") {
			note = "💌 Dad says: " + DAD_NOTES[recordDadLetter()];
			scol = C.yellow;
		} else if (this.pkgType === "invite") {
			note = Phaser.Utils.Array.GetRandom([
				"I'll be there! 🎈",
				"A party?! Yay! 🎉",
				"See you at sundown! 🌙",
			]);
			scol = C.pink;
		} else if (this.pkgType === "cake") {
			note = Phaser.Utils.Array.GetRandom([
				"Yummy cake! 🎂",
				"Happy Birthday! 🥳",
				"My favourite! 🍰",
			]);
			scol = C.orange;
		} else if (this.pkgType === "neighbor") {
			note = "A letter from " + this.sender.name + "! 💕";
			scol = C.blue;
		} else {
			note = Phaser.Utils.Array.GetRandom([
				"Thank you! 💕",
				"Yay, my package! 🎉",
				"You're the best! ⭐",
				"Woohoo! 🌈",
			]);
		}
		this.speech(note, scol);
		if (["normal", "fragile", "pizza"].indexOf(this.pkgType) >= 0)
			this.factBubble(h);
	}
	/* end-of-route party celebration (Party Day + Birthday Day) */
	partyFinale() {
		const ov = this.add
			.rectangle(GW / 2, GH / 2, GW, GH, 0x140a24, 0)
			.setScrollFactor(0)
			.setDepth(4000)
			.setInteractive();
		this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 450 });
		sfx.win();
		this.time.delayedCall(330, () => {
			this.add
				.text(GW / 2, GH * 0.17, "🎉 Party Time! 🎉", {
					fontFamily: "Fredoka One",
					fontSize: fz(0.07),
					color: HX.pink,
					stroke: "#0f0a1e",
					strokeThickness: 6,
				})
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(4010);
			this.add
				.text(GW / 2, GH * 0.29, "Everyone you invited came over! 💕", {
					fontFamily: "Nunito",
					fontStyle: "900",
					fontSize: fz(0.03),
					color: HX.text,
					align: "center",
					wordWrap: { width: GW * 0.8 },
				})
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(4010);
			const cake = this.add
				.text(GW / 2, GH * 0.45, "🎂", { fontSize: fz(0.16) })
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(4012)
				.setScale(0);
			this.tweens.add({
				targets: cake,
				scale: 1,
				duration: 400,
				ease: "Back.out",
			});
			const guests =
				this.partyGuests && this.partyGuests.length
					? this.partyGuests
					: this.route.map((h) => h.emoji);
			const n = guests.length,
				gsp = Math.min(GW * 0.092, (GW * 0.86) / Math.max(1, n));
			guests.forEach((emo, i) => {
				const gx = GW / 2 + (i - (n - 1) / 2) * gsp,
					gy = GH * 0.62;
				const a = this.add
					.text(gx, gy, emo, { fontSize: fz(0.055) })
					.setOrigin(0.5)
					.setScrollFactor(0)
					.setDepth(4013)
					.setAlpha(0);
				this.tweens.add({ targets: a, alpha: 1, duration: 200, delay: i * 70 });
				this.tweens.add({
					targets: a,
					y: gy - 12,
					duration: 340,
					yoyo: true,
					repeat: -1,
					delay: i * 70,
					ease: "Sine.inOut",
				});
			});
			for (let i = 0; i < 14; i++) {
				const bx = Phaser.Math.Between(30, GW - 30);
				const b = this.add
					.text(
						bx,
						GH + 30,
						Phaser.Utils.Array.GetRandom(["🎈", "🎈", "🎉", "✨"]),
						{ fontSize: fz(0.05) },
					)
					.setOrigin(0.5)
					.setScrollFactor(0)
					.setDepth(4005);
				this.tweens.add({
					targets: b,
					y: -40,
					x: bx + Phaser.Math.Between(-30, 30),
					duration: Phaser.Math.Between(2200, 3600),
					delay: Phaser.Math.Between(0, 1200),
					repeat: -1,
					ease: "Sine.in",
				});
			}
			const cols = [C.pink, C.yellow, C.green, C.blue, C.purple, C.orange];
			for (let i = 0; i < 60; i++) {
				const c = this.add
					.rectangle(GW / 2, GH * 0.4, 8, 8, Phaser.Utils.Array.GetRandom(cols))
					.setScrollFactor(0)
					.setDepth(4006);
				const a = Math.random() * Math.PI * 2,
					d = 80 + Math.random() * 220;
				this.tweens.add({
					targets: c,
					x: GW / 2 + Math.cos(a) * d,
					y: GH * 0.4 + Math.sin(a) * d,
					angle: Phaser.Math.Between(180, 720),
					alpha: 0,
					duration: Phaser.Math.Between(900, 1600),
					onComplete: () => c.destroy(),
				});
			}
			const bfs = fz(0.04),
				bfn = parseFloat(String(bfs)) || 24,
				bw = Math.max(GW * 0.3, 180),
				bh = bfn * 1.7 + 18,
				by = GH * 0.82;
			const bg = this.add.graphics().setScrollFactor(0).setDepth(4100);
			bg.fillStyle(0x000000, 0.3).fillRoundedRect(
				GW / 2 - bw / 2,
				by - bh / 2 + 5,
				bw,
				bh,
				bh / 2,
			);
			bg.fillStyle(C.pink, 1).fillRoundedRect(
				GW / 2 - bw / 2,
				by - bh / 2,
				bw,
				bh,
				bh / 2,
			);
			this.add
				.text(GW / 2, by, "Yay! 🎉", {
					fontFamily: "Fredoka One",
					fontSize: bfs,
					color: "#ffffff",
				})
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(4101);
			const hit = this.add
				.rectangle(GW / 2, by, bw, bh, 0xffffff, 0.001)
				.setScrollFactor(0)
				.setDepth(4102)
				.setInteractive({ useHandCursor: true });
			hit.on("pointerup", () => this.scene.start("Win", { party: true }));
		});
	}
	speech(txt, col) {
		const y = GH * 0.3;
		const t = this.add
			.text(GW / 2, y, txt, {
				fontFamily: "Fredoka One",
				fontSize: fz(0.034),
				color: Phaser.Display.Color.IntegerToColor(col).rgba,
				align: "center",
				wordWrap: { width: GW * 0.8 },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2600)
			.setScale(0.6)
			.setAlpha(0);
		this.tweens.add({
			targets: t,
			scale: 1,
			alpha: 1,
			duration: 200,
			ease: "Back.out",
			onComplete: () =>
				this.tweens.add({
					targets: t,
					alpha: 0,
					delay: 1500,
					duration: 500,
					onComplete: () => t.destroy(),
				}),
		});
	}
	factBubble(h) {
		const y = GH * 0.3 + fz(0.034).slice(0, -2) * 1.4;
		const t = this.add
			.text(GW / 2, GH * 0.385, "🦉 " + h.fact, {
				fontFamily: "Nunito",
				fontStyle: "900",
				fontSize: fz(0.026),
				color: HX.blue,
				align: "center",
				backgroundColor: "rgba(15,10,30,0.55)",
				padding: { x: 12, y: 7 },
				wordWrap: { width: GW * 0.78 },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2600)
			.setAlpha(0);
		this.tweens.add({
			targets: t,
			alpha: 1,
			duration: 250,
			onComplete: () =>
				this.tweens.add({
					targets: t,
					alpha: 0,
					delay: 2000,
					duration: 500,
					onComplete: () => t.destroy(),
				}),
		});
	}
	flyTip(tip, x, y) {
		if (x == null) {
			x = this.van.x;
			y = this.van.y;
		}
		const t = this.add
			.text(x, y, "+" + tip + " 🪙", {
				fontFamily: "Fredoka One",
				fontSize: "28px",
				color: HX.yellow,
				stroke: "#3a1d5c",
				strokeThickness: 4,
			})
			.setOrigin(0.5)
			.setDepth(9700);
		this.tweens.add({
			targets: t,
			y: t.y - 70,
			alpha: 0,
			scale: 1.2,
			duration: 1000,
			ease: "Quad.out",
			onComplete: () => t.destroy(),
		});
	}

	/* ── HUD ── */
	buildHUD() {
		const pad = 14,
			ch = 40;
		this.hudG = this.add.graphics().setScrollFactor(0).setDepth(1500);
		this.pkgEmo = this.add
			.text(pad + 16, pad + ch / 2, "📦", { fontSize: fz(0.028) })
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1502);
		this.pkgTxt = this.add
			.text(pad + 34, pad + ch / 2, "", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.03),
				color: HX.green,
			})
			.setOrigin(0, 0.5)
			.setScrollFactor(0)
			.setDepth(1502);
		this.coinEmo = this.add
			.text(0, pad + ch / 2, "🪙", { fontSize: fz(0.028) })
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1502);
		this.coinTxt = this.add
			.text(0, pad + ch / 2, "", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.03),
				color: HX.yellow,
			})
			.setOrigin(0, 0.5)
			.setScrollFactor(0)
			.setDepth(1502);
		// banner
		this.banner = this.add
			.container(GW / 2, pad + ch / 2)
			.setScrollFactor(0)
			.setDepth(1502)
			.setVisible(false);
		this.bannerBG = this.add.graphics();
		this.bannerLabel = this.add
			.text(0, 0, "", {
				fontFamily: "Nunito",
				fontStyle: "900",
				fontSize: fz(0.025),
				color: HX.text,
			})
			.setOrigin(0, 0.5);
		this.bannerTxt = this.add
			.text(0, 0, "", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.029),
				color: HX.yellow,
			})
			.setOrigin(0, 0.5);
		this.banner.add([this.bannerBG, this.bannerLabel, this.bannerTxt]);
		// the destination banner doubles as the one-tap "drive me there" button
		this.banner.setInteractive(
			new Phaser.Geom.Rectangle(-100, -22, 200, 44),
			Phaser.Geom.Rectangle.Contains,
		);
		this.banner.input.cursor = "pointer";
		this.banner.on("pointerdown", () => {
			resumeAudio();
			this.goToStop();
			this.tweens.add({
				targets: this.banner,
				scaleX: 0.94,
				scaleY: 0.94,
				duration: 90,
				yoyo: true,
			});
		});
		// sound + music top-right
		this.musicBtn = this.add
			.text(GW - pad - 22, pad + ch / 2, G.musicOn ? "🎵" : "🔈", {
				fontSize: fz(0.032),
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1502)
			.setInteractive({ useHandCursor: true });
		this.musicBtn.on("pointerdown", () => this.cycleMusic());
		this.soundBtn = this.add
			.text(
				GW - pad - 22 - Math.min(GW, GH) * 0.06,
				pad + ch / 2,
				G.soundOn ? "🔊" : "🔇",
				{ fontSize: fz(0.032) },
			)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1502)
			.setInteractive({ useHandCursor: true });
		this.soundBtn.on("pointerdown", () => {
			G.soundOn = !G.soundOn;
			G.save();
			this.soundBtn.setText(G.soundOn ? "🔊" : "🔇");
		});
		this.fsBtn = this.add
			.text(GW - pad - 22 - Math.min(GW, GH) * 0.12, pad + ch / 2, "⛶", {
				fontSize: fz(0.032),
				color: HX.text,
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1502)
			.setInteractive({ useHandCursor: true });
		this.fsBtn.on("pointerdown", () => {
			toggleFullscreen();
		});
		this.updateHUD();
	}
	updateHUD() {
		const pad = 14,
			ch = 40;
		this.pkgTxt.setText(G.delivered + "/" + G.total);
		const coinX = pad + (this.pkgTxt.x + this.pkgTxt.width) + 18;
		this.coinEmo.setX(coinX + 12);
		this.coinTxt.setX(coinX + 28).setText("" + G.coins);
		const g = this.hudG;
		g.clear();
		g.fillStyle(C.card, 0.8);
		g.lineStyle(1.5, C.cardB, 1);
		const c1w = this.pkgTxt.x + this.pkgTxt.width - pad + 12;
		g.fillRoundedRect(pad - 2, pad, c1w, ch, ch / 2);
		g.strokeRoundedRect(pad - 2, pad, c1w, ch, ch / 2);
		const c2w = this.coinTxt.x + this.coinTxt.width - coinX + 14;
		g.fillRoundedRect(coinX - 6, pad, c2w, ch, ch / 2);
		g.strokeRoundedRect(coinX - 6, pad, c2w, ch, ch / 2);
		if (this.bannerLabel) {
			const totalW = this.bannerLabel.width + this.bannerTxt.width + 18;
			this.bannerLabel.setX(-totalW / 2 + 9);
			this.bannerTxt.setX(this.bannerLabel.x + this.bannerLabel.width + 8);
			this.bannerBG
				.clear()
				.fillStyle(C.card, 0.85)
				.fillRoundedRect(-totalW / 2 - 12, -ch / 2, totalW + 24, ch, ch / 2);
			this.bannerBG
				.lineStyle(2.5, C.green, 1)
				.strokeRoundedRect(-totalW / 2 - 12, -ch / 2, totalW + 24, ch, ch / 2);
			if (this.banner.input)
				this.banner.input.hitArea.setTo(
					-totalW / 2 - 12,
					-ch / 2,
					totalW + 24,
					ch,
				);
		}
	}

	/* ── controls ── */
	buildControls() {
		this.ctlRects = [];
		const bottom = GH - Math.max(22, GH * 0.04);
		// bigger, kid-friendly tap targets (still scale with width so they never overlap on small phones)
		const sz = Math.min(92, GW * 0.17);
		holdBtn(this, 28 + sz / 2, bottom - sz / 2, sz, sz, "◀", "left", this);
		holdBtn(
			this,
			28 + sz + 14 + sz / 2,
			bottom - sz / 2,
			sz,
			sz,
			"▶",
			"right",
			this,
		);
		const gr = Math.min(54, GW * 0.105),
			sm = Math.min(40, GW * 0.078);
		const GOx = GW - 26 - gr,
			GOy = bottom - gr;
		holdBtn(this, GOx, GOy, gr * 2, gr * 2, "GO", "gas", this, true);
		const revY = GOy - gr - sm - 16;
		holdBtn(this, GOx, revY, sm * 2, sm * 2, "▼", "rev", this);
		const colX = GOx - gr - sm - 18;
		this.turboBtn = this.makeRound(colX, GOy, sm, "⚡", C.yellow, () =>
			this.doTurbo(),
		);
		this.honkBtn = this.makeRound(colX, revY, sm, "🎺", C.blue, () =>
			this.honk(),
		);
		this.turboRing = this.add.graphics().setScrollFactor(0).setDepth(1903);
	}
	makeRound(x, y, r, label, col, cb) {
		const g = this.add.graphics().setScrollFactor(0).setDepth(1900);
		g.fillStyle(0x000000, 0.28).fillCircle(x, y + 5, r);
		g.fillStyle(col, 0.9).fillCircle(x, y, r);
		g.lineStyle(2, 0xffffff, 0.2).strokeCircle(x, y, r);
		const t = this.add
			.text(x, y, label, { fontSize: Math.floor(r * 0.9) + "px" })
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(1901);
		const hit = this.add
			.rectangle(x, y, r * 2, r * 2, 0xffffff, 0.001)
			.setScrollFactor(0)
			.setDepth(1902)
			.setInteractive();
		hit.on("pointerdown", () => {
			resumeAudio();
			cb();
			t.y = y + 3;
		});
		hit.on("pointerup", () => (t.y = y));
		hit.on("pointerout", () => (t.y = y));
		this.ctlRects.push({ x, y, w: r * 2, h: r * 2 });
		return { g, t, x, y, r };
	}
	doTurbo() {
		if (this.turbo < 0.34) {
			sfx.deny();
			this.actionBanner("Charging… ⚡", C.yellow);
			return;
		}
		this.boostT = Math.max(this.boostT, 1.1);
		this.turbo = Math.max(0, this.turbo - 0.5);
		sfx.boost();
		this.actionBanner("TURBO! 💨", C.yellow);
	}
	/* one-tap auto-pilot: always drive to the next delivery house (kid-friendly) */
	goToStop() {
		if (!this.driving) {
			this.startDriving();
			return;
		}
		if (this.target) {
			this.setDest(this.target.door.x, this.target.door.y);
			this.actionBanner("On my way! 🚐", C.green);
		} else {
			this.actionBanner("All delivered! 🎉", C.green);
		}
	}
	honk() {
		if (this._honkCd && this.time.now < this._honkCd) return;
		this._honkCd = this.time.now + 300;
		carHorn();
		if (this.petIcon) {
			this.tweens.add({
				targets: this.petIcon,
				scaleX: 1.4,
				scaleY: 1.4,
				duration: 120,
				yoyo: true,
			});
		}
		const n = this.add
			.text(this.van.x, this.van.y - 26, "🎵", { fontSize: "24px" })
			.setOrigin(0.5)
			.setDepth(6000);
		this.tweens.add({
			targets: n,
			y: n.y - 50,
			x: n.x + 20,
			alpha: 0,
			duration: 800,
			onComplete: () => n.destroy(),
		});
		// wave from current target's resident if near
		if (this.target) {
			const d = Phaser.Math.Distance.Between(
				this.van.x,
				this.van.y,
				this.target.door.x,
				this.target.door.y,
			);
			if (d < 360) {
				const w = this.add
					.text(this.target.door.x, this.target.door.y - 30, "👋", {
						fontSize: "30px",
					})
					.setOrigin(0.5)
					.setDepth(this.target.y + 6);
				this.tweens.add({
					targets: w,
					angle: 20,
					duration: 150,
					yoyo: true,
					repeat: 2,
					onComplete: () =>
						this.tweens.add({
							targets: w,
							alpha: 0,
							duration: 300,
							onComplete: () => w.destroy(),
						}),
				});
			}
		}
		// honk in front of the house → the animal comes out to your van for the mail
		if (this.atHouse && this.target && this.carrying && !this.delivering) {
			const d = Phaser.Math.Distance.Between(
				this.van.x,
				this.van.y,
				this.target.door.x,
				this.target.door.y,
			);
			if (d < 150) {
				this.callAnimalToVan(this.target);
			}
		}
	}
	callAnimalToVan(h) {
		this.delivering = true;
		this.hideHonkPrompt();
		this.atHouse = false;
		this.speed = 0;
		this.clearDest();
		const vx = this.van.x,
			vy = this.van.y;
		const animal = this.add
			.text(h.door.x, h.door.y, h.emoji, { fontSize: "42px" })
			.setOrigin(0.5, 0.9)
			.setDepth(9500);
		animal.setFlipX(vx > h.door.x);
		const hop = this.tweens.add({
			targets: animal,
			y: "-=9",
			duration: 170,
			yoyo: true,
			repeat: -1,
			ease: "Quad.out",
		});
		const ax = vx + (h.door.x > vx ? -30 : 30),
			ay = vy;
		const walkMs = Phaser.Math.Clamp(
			Phaser.Math.Distance.Between(h.door.x, h.door.y, ax, ay) * 2.4,
			360,
			1100,
		);
		this.tweens.add({
			targets: animal,
			x: ax,
			duration: walkMs,
			ease: "Sine.inOut",
			onUpdate: () => {
				animal.setDepth(animal.y);
			},
			onComplete: () => {
				hop.stop();
				// the package hops from the van into the animal's arms
				const pkg = this.add
					.text(vx, vy, this.pkgIcon.text || "📦", { fontSize: "22px" })
					.setOrigin(0.5)
					.setDepth(9501);
				this.pkgIcon.setVisible(false);
				this.tweens.add({
					targets: pkg,
					x: ax,
					y: ay - 16,
					duration: 300,
					ease: "Quad.out",
					onComplete: () => {
						pkg.destroy();
						this.deliver(h, ax, ay, animal);
					},
				});
			},
		});
	}
	bindKeys() {
		const map = {
			ArrowLeft: "left",
			KeyA: "left",
			ArrowRight: "right",
			KeyD: "right",
			ArrowUp: "gas",
			KeyW: "gas",
			Space: "gas",
			ArrowDown: "rev",
			KeyS: "rev",
		};
		this.input.keyboard.on("keydown", (e) => {
			if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
				this.doTurbo();
				return;
			}
			if (e.code === "KeyH") {
				this.honk();
				return;
			}
			const k = map[e.code];
			if (k) {
				this.ctl[k] = true;
				resumeAudio();
				this.clearDest();
				if (!this.driving) this.startDriving();
			}
		});
		this.input.keyboard.on("keyup", (e) => {
			const k = map[e.code];
			if (k) this.ctl[k] = false;
		});
	}
	overControl(px, py) {
		// the destination banner is a button too — don't also read it as a map tap
		if (this.banner && this.banner.visible && this.banner.input) {
			const ha = this.banner.input.hitArea,
				bx = this.banner.x,
				by = this.banner.y;
			if (
				px > bx + ha.x &&
				px < bx + ha.x + ha.width &&
				py > by + ha.y &&
				py < by + ha.y + ha.height
			)
				return true;
		}
		return this.ctlRects.some(
			(r) =>
				px > r.x - r.w / 2 &&
				px < r.x + r.w / 2 &&
				py > r.y - r.h / 2 &&
				py < r.y + r.h / 2,
		);
	}
	bindDrag() {
		this.dragG = this.add.graphics().setScrollFactor(0).setDepth(1800);
		this.boostG = this.add.graphics().setScrollFactor(0).setDepth(1150);
		this.destG = this.add.graphics().setDepth(50);
		this.destMarker = this.add
			.text(0, 0, "📍", { fontSize: "34px" })
			.setOrigin(0.5, 1)
			.setDepth(9000)
			.setVisible(false);
		this._press = null;
		// unified control: the van drives to wherever your finger is. Tap = go there.
		// Hold & drag = the destination follows your finger live (steer by pointing).
		const aim = (p) => {
			const r = this.mmRect;
			if (
				r &&
				p.x >= r.x0 - 8 &&
				p.x <= r.x0 + r.M + 8 &&
				p.y >= r.y0 - 8 &&
				p.y <= r.y0 + r.M + 8
			) {
				this.setDest((p.x - r.x0) / r.sc, (p.y - r.y0) / r.sc);
				return;
			}
			this.setDest(p.worldX, p.worldY);
		};
		this.input.on("pointerdown", (p) => {
			resumeAudio();
			if (!this.driving) {
				this.startDriving();
				return;
			}
			if (this.overControl(p.x, p.y)) {
				this._press = null;
				return;
			}
			this._press = { id: p.id };
			aim(p);
		});
		this.input.on("pointermove", (p) => {
			if (!this._press || p.id !== this._press.id) return;
			aim(p);
		});
		const end = (p) => {
			if (this._press && p.id === this._press.id) this._press = null;
		};
		this.input.on("pointerup", end);
		this.input.on("pointerupoutside", end);
	}
	setDest(x, y) {
		x = Phaser.Math.Clamp(x, 20, WORLD - 20);
		y = Phaser.Math.Clamp(y, 20, WORLD - 20);
		this.drag.active = false;
		this.dest = { x, y };
		// near taps / live finger-steer → drive straight there; far taps → route along streets
		const far =
			Phaser.Math.Distance.Between(this.van.x, this.van.y, x, y) > 520;
		this.routeWPs = far ? roadRoute(this.van.x, this.van.y, x, y) : null;
		this.destMarker.setVisible(true).setPosition(x, y - 16);
		this.tweens.killTweensOf(this.destMarker);
		this.destMarker.setScale(1.4);
		this.tweens.add({
			targets: this.destMarker,
			scale: 1,
			duration: 260,
			ease: "Back.out",
		});
	}
	clearDest() {
		this.dest = null;
		this.routeWPs = null;
		if (this.destMarker) this.destMarker.setVisible(false);
		if (this.destG) this.destG.clear();
	}
	drawDest() {
		const g = this.destG;
		g.clear();
		if (!this.dest) return;
		// dotted planned path: van → remaining waypoints → dest
		const path = [{ x: this.van.x, y: this.van.y }];
		if (this.routeWPs) this.routeWPs.forEach((w) => path.push(w));
		path.push(this.dest);
		const dash = 14,
			gap = 12,
			off = (this.time.now / 55) % (dash + gap);
		g.fillStyle(C.yellow, 0.5);
		for (let i = 0; i < path.length - 1; i++) {
			const a = path[i],
				b = path[i + 1];
			const len = Math.hypot(b.x - a.x, b.y - a.y);
			if (len < 1) continue;
			const ux = (b.x - a.x) / len,
				uy = (b.y - a.y) / len;
			for (let d = i === 0 ? off : 0; d < len; d += dash + gap) {
				const x = a.x + ux * d,
					y = a.y + uy * d;
				g.fillCircle(x, y, 3.2);
			}
		}
		const p = 0.5 + 0.5 * Math.sin(this.time.now / 200),
			r = 18 + p * 10;
		g.lineStyle(4, C.yellow, 0.85).strokeCircle(this.dest.x, this.dest.y, r);
		g.fillStyle(C.yellow, 0.22).fillCircle(this.dest.x, this.dest.y, r);
	}

	toast(txt, size) {
		const t = this.add
			.text(GW / 2, GH * 0.44, txt, {
				fontFamily: "Fredoka One",
				fontSize: (size || 40) + "px",
				color: "#ffffff",
				stroke: HX.purple,
				strokeThickness: 6,
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(3000)
			.setScale(0.5)
			.setAlpha(0);
		this.tweens.add({
			targets: t,
			scale: 1.05,
			alpha: 1,
			duration: 200,
			ease: "Back.out",
			onComplete: () =>
				this.tweens.add({
					targets: t,
					y: t.y - 44,
					alpha: 0,
					duration: 850,
					delay: 350,
					onComplete: () => t.destroy(),
				}),
		});
	}
	/* small floating text in WORLD space (smashes, +coins, etc.) */
	popText(txt, col, x, y) {
		const t = this.add
			.text(x, y - 10, txt, {
				fontFamily: "Fredoka One",
				fontSize: "24px",
				color: Phaser.Display.Color.IntegerToColor(col).rgba,
				stroke: "#3a1d5c",
				strokeThickness: 4,
			})
			.setOrigin(0.5)
			.setDepth(7000)
			.setScale(0.6);
		this.tweens.add({ targets: t, scale: 1, duration: 160, ease: "Back.out" });
		this.tweens.add({
			targets: t,
			y: t.y - 46,
			alpha: 0,
			duration: 850,
			delay: 200,
			onComplete: () => t.destroy(),
		});
	}
	/* big obvious action banner, screen-fixed (TURBO!, etc.) */
	actionBanner(txt, col) {
		if (this._ab) {
			this.tweens.killTweensOf(this._ab);
			this._ab.destroy();
		}
		this._ab = this.add
			.text(GW / 2, GH * 0.2, txt, {
				fontFamily: "Fredoka One",
				fontSize: fz(0.07),
				color: Phaser.Display.Color.IntegerToColor(col).rgba,
				stroke: "#3a1d5c",
				strokeThickness: 7,
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(3200)
			.setScale(0.4)
			.setAlpha(0);
		const ab = this._ab;
		this.tweens.add({
			targets: ab,
			scale: 1.1,
			alpha: 1,
			duration: 220,
			ease: "Back.out",
			onComplete: () =>
				this.tweens.add({
					targets: ab,
					scale: 1.4,
					alpha: 0,
					y: ab.y - 30,
					duration: 520,
					delay: 200,
					onComplete: () => {
						ab.destroy();
						if (this._ab === ab) this._ab = null;
					},
				}),
		});
	}

	/* ── update ── */
	update(time, delta) {
		const dt = Math.min(0.05, delta / 1000);
		if (!this.driving) {
			this.glowPulse();
			return;
		}
		const v = this.van,
			veh = G.veh();
		const MAX = 205 * veh.spd * (this.boostT > 0 ? 1.5 : 1),
			ACC = 400 * veh.spd * (this.boostT > 0 ? 1.4 : 1),
			REV = 125,
			TURN = 4.2 * veh.turn;
		const useDrag = this.drag.active && this.drag.mag > 0.08;
		const anyBtn =
			this.ctl.left || this.ctl.right || this.ctl.gas || this.ctl.rev;
		// when carrying & near the target house, ease up to the FRONT (door) and stop — don't drive into the house
		const nearTarget =
			this.carrying &&
			this.target &&
			!this.delivering &&
			Phaser.Math.Distance.Between(
				v.x,
				v.y,
				this.target.door.x,
				this.target.door.y,
			) < 230;
		if (nearTarget && !anyBtn && !useDrag) {
			this.dest = { x: this.target.door.x, y: this.target.door.y };
			this.routeWPs = null;
			if (this.destMarker) this.destMarker.setVisible(false);
		}
		// ── anti-stuck: if wedged against a building while trying to move, back up & turn away ──
		const bb = v.body;
		const blocked =
			bb.blocked.up || bb.blocked.down || bb.blocked.left || bb.blocked.right;
		const realSpd = Math.hypot(bb.velocity.x, bb.velocity.y);
		const trying =
			!!this.dest || (anyBtn && (this.ctl.gas || this.ctl.rev)) || useDrag;
		if (this.escapeT > 0) this.escapeT -= dt;
		if (this.escapeT <= 0) {
			if (blocked && trying && realSpd < 55 && !nearTarget) {
				this.stuckT = (this.stuckT || 0) + dt;
				if (this.stuckT > 0.28) {
					this.escapeT = 0.6;
					this.stuckT = 0;
					let ed = 1;
					if (this.dest) {
						let d =
							Math.atan2(this.dest.y - v.y, this.dest.x - v.x) - this.heading;
						while (d > Math.PI) d -= 2 * Math.PI;
						while (d < -Math.PI) d += 2 * Math.PI;
						ed = d >= 0 ? 1 : -1;
					} else if (this.ctl.left) ed = -1;
					this.escapeDir = ed;
				}
			} else this.stuckT = Math.max(0, (this.stuckT || 0) - dt * 2);
		}
		if (this.escapeT > 0) {
			this.speed = -REV * 0.85;
			this.heading += this.escapeDir * TURN * dt * 1.15;
		} else if (useDrag) {
			let diff = this.drag.ang - this.heading;
			while (diff > Math.PI) diff -= Math.PI * 2;
			while (diff < -Math.PI) diff += Math.PI * 2;
			const step = TURN * dt * (0.55 + 0.45 * this.drag.mag);
			this.heading += Phaser.Math.Clamp(diff, -step, step);
			this.speed += ACC * dt * this.drag.mag;
		} else if (anyBtn) {
			const steer = (this.ctl.left ? -1 : 0) + (this.ctl.right ? 1 : 0);
			this.heading += steer * TURN * dt;
			if (this.ctl.gas) this.speed += ACC * dt;
			else if (this.ctl.rev) this.speed -= ACC * dt;
			else {
				this.speed *= Math.pow(0.1, dt);
				if (Math.abs(this.speed) < 3) this.speed = 0;
			}
		} else if (this.dest) {
			let tx = this.dest.x,
				ty = this.dest.y,
				isFinal = true;
			if (this.routeWPs && this.routeWPs.length) {
				const wp = this.routeWPs[0];
				tx = wp.x;
				ty = wp.y;
				isFinal = false;
			}
			const dx = tx - v.x,
				dy = ty - v.y,
				dist = Math.hypot(dx, dy);
			const want = Math.atan2(dy, dx);
			let diff = want - this.heading;
			while (diff > Math.PI) diff -= Math.PI * 2;
			while (diff < -Math.PI) diff += Math.PI * 2;
			// turn faster when slow so the van can pivot toward the target instead of orbiting it
			const turnBoost = 1 + (1 - Math.min(1, Math.abs(this.speed) / MAX)) * 0.9;
			const ts = TURN * dt * 1.5 * turnBoost;
			if (dist > 20) this.heading += Phaser.Math.Clamp(diff, -ts, ts);
			// crawl when a big turn is needed (small turning radius), full speed only when aimed straight
			const aim = Math.max(0, 1 - Math.abs(diff) / 0.9);
			if (isFinal) {
				const desired =
					dist < 30
						? 0
						: Phaser.Math.Clamp(dist * 2.4, 40, MAX) * (0.3 + 0.7 * aim);
				this.speed += (desired - this.speed) * Math.min(1, dt * 5);
				if (dist < 30 && Math.abs(this.speed) < 26) {
					this.speed = 0;
					this.clearDest();
				}
			} else {
				const desired = MAX * (0.22 + 0.78 * aim);
				this.speed += (desired - this.speed) * Math.min(1, dt * 5);
				// advance when close, or once we've driven past the waypoint (prevents orbiting)
				const passed =
					dx * Math.cos(this.heading) + dy * Math.sin(this.heading) < 0;
				if (dist < 78 || (passed && dist < 150)) this.routeWPs.shift();
			}
		} else {
			this.speed *= Math.pow(0.1, dt);
			if (Math.abs(this.speed) < 3) this.speed = 0;
		}
		this.speed = Phaser.Math.Clamp(this.speed, -REV, MAX);
		if (this.escapeT <= 0 && !onRoad(v.x, v.y))
			this.speed = Phaser.Math.Clamp(this.speed, -REV * 0.6, MAX * 0.45); // grass is slow
		if (this.escapeT <= 0 && blocked) this.speed *= 0.6;
		// slide along walls instead of pinning: cancel only the into-wall velocity component
		let vx = Math.cos(this.heading) * this.speed,
			vy = Math.sin(this.heading) * this.speed;
		if ((bb.blocked.left && vx < 0) || (bb.blocked.right && vx > 0)) vx = 0;
		if ((bb.blocked.up && vy < 0) || (bb.blocked.down && vy > 0)) vy = 0;
		v.body.setVelocity(vx, vy);
		v.setRotation(this.heading + Math.PI / 2);
		v.setDepth(v.y);
		// pet sits in the van, facing the way you drive (so it never looks backwards)
		if (this.petIcon) {
			const px = v.x - Math.cos(this.heading) * 6,
				py = v.y - Math.sin(this.heading) * 6;
			this.petIcon.setPosition(px, py).setDepth(v.y + 2);
			this.petIcon.setFlipX(Math.cos(this.heading) > 0);
		}
		if (this.carrying) this.pkgIcon.setPosition(v.x, v.y).setDepth(v.y + 2);
		// turbo recharge + boost decay
		if (this.boostT > 0) this.boostT -= dt;
		this.turbo = Math.min(1, this.turbo + dt * 0.22);
		this.drawTurboRing();
		// boost pads
		this.pads.forEach((p) => {
			if (Phaser.Math.Distance.Between(v.x, v.y, p.x, p.y) < 44) {
				if (this.boostT < 0.4) {
					this.boostT = 0.9;
					sfx.boost();
					this.actionBanner("ZOOM! 💨", C.green);
				}
			}
		});
		// smash props — drive through street stuff at speed for chaos!
		const realNow = Math.hypot(bb.velocity.x, bb.velocity.y);
		if (this.props) {
			this.props.forEach((p) => {
				if (
					p.alive &&
					realNow > 70 &&
					Phaser.Math.Distance.Between(v.x, v.y, p.x, p.y) < 36
				)
					this.smashProp(p);
			});
		}
		// SPLASH! drive into a pond — ducks scatter, water slows you way down
		if (this.parks) {
			for (const pk of this.parks) {
				if (pk.type === "pond" || pk.type === "park") {
					const dx = (v.x - pk.x) / 118,
						dy = (v.y - pk.y) / 80; // pond ellipse ~236x160
					if (dx * dx + dy * dy < 1) {
						this.speed *= Math.pow(0.55, dt * 8); // heavy water drag
						if (this.time.now > (this._splashCd || 0) && realNow > 40) {
							this._splashCd = this.time.now + 260;
							this.splash(v.x, v.y, pk);
						}
					}
				}
			}
		}
		// animal crossing — STOP for the critters!
		this.updateCrossings(dt);
		let mustStop = false,
			stopCr = null;
		if (this.crossings) {
			for (const cr of this.crossings) {
				if (
					cr.active &&
					Phaser.Math.Distance.Between(v.x, v.y, cr.x, cr.y) < 118
				) {
					mustStop = true;
					stopCr = cr;
					break;
				}
			}
		}
		if (mustStop) {
			this.speed = Phaser.Math.Clamp(
				this.speed * Math.pow(0.0005, dt),
				-30,
				18,
			);
			this.showStopSign(stopCr);
		} else if (this._stopSign) {
			this.tweens.killTweensOf(this._stopSign);
			this._stopSign.destroy();
			this._stopSign = null;
			if (this._stopTxt) {
				this._stopTxt.destroy();
				this._stopTxt = null;
			}
		}
		// coins
		this.coins = this.coins.filter((c) => {
			if (Phaser.Math.Distance.Between(v.x, v.y, c.x, c.y) < 40) {
				G.coins += 2;
				G.save();
				sfx.coin();
				this.updateHUD();
				const fx = this.add
					.text(c.x, c.y, "+2", {
						fontFamily: "Fredoka One",
						fontSize: "18px",
						color: HX.yellow,
					})
					.setOrigin(0.5)
					.setDepth(5000);
				this.tweens.add({
					targets: fx,
					y: fx.y - 30,
					alpha: 0,
					duration: 600,
					onComplete: () => fx.destroy(),
				});
				c.destroy();
				return false;
			}
			return true;
		});
		// pizza cooling
		if (this.pkgType === "pizza" && this.carrying) {
			this.pizzaT = Math.max(0, this.pizzaT - dt / 18);
		}
		// delivery — pull up to the target house (any side); animal takes the mail
		// arrive in front of the house → prompt to honk; the animal comes out to your van
		if (this.target && this.carrying && !this.delivering) {
			const h = this.target;
			const near =
				Phaser.Math.Distance.Between(v.x, v.y, h.door.x, h.door.y) < 120;
			if (near) {
				if (!this.atHouse) {
					this.atHouse = true;
					this.showHonkPrompt(h);
				}
			} else if (this.atHouse) {
				this.atHouse = false;
				this.hideHonkPrompt();
			}
		}
		this.glowPulse();
		this.updateTrail();
		this.drawDest();
		this.drawHeadlights();
		this.drawJoystick();
		this.drawSpeedLines();
		this.updateRain(dt);
		this.drawMinimap();
		this.drawArrow();
	}
	showHonkPrompt(h) {
		this.hideHonkPrompt();
		this.sleepZ = this.add
			.text(h.door.x, h.door.y - 20, h.emoji, { fontSize: "30px" })
			.setOrigin(0.5, 1)
			.setDepth(h.y + 8);
		this.tweens.add({
			targets: this.sleepZ,
			y: this.sleepZ.y - 10,
			duration: 520,
			yoyo: true,
			repeat: -1,
			ease: "Sine.inOut",
		});
		this.honkHint = this.add
			.text(
				GW / 2,
				GH * 0.3,
				"🎺 Honk to call " + h.name + " " + h.emoji + " out!",
				{
					fontFamily: "Fredoka One",
					fontSize: fz(0.034),
					color: HX.yellow,
					stroke: "#3a1d5c",
					strokeThickness: 5,
					align: "center",
					wordWrap: { width: GW * 0.85 },
				},
			)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2600);
		this.tweens.add({
			targets: this.honkHint,
			scale: 1.08,
			duration: 520,
			yoyo: true,
			repeat: -1,
			ease: "Sine.inOut",
		});
		// bounce the honk button to draw the eye
		if (this.honkBtn && this.honkBtn.t) {
			this.tweens.killTweensOf(this.honkBtn.t);
			this.tweens.add({
				targets: this.honkBtn.t,
				scale: 1.25,
				duration: 400,
				yoyo: true,
				repeat: -1,
				ease: "Sine.inOut",
			});
		}
	}
	hideHonkPrompt() {
		if (this.sleepZ) {
			this.tweens.killTweensOf(this.sleepZ);
			this.sleepZ.destroy();
			this.sleepZ = null;
		}
		if (this.honkHint) {
			this.tweens.killTweensOf(this.honkHint);
			this.honkHint.destroy();
			this.honkHint = null;
		}
		if (this.honkBtn && this.honkBtn.t) {
			this.tweens.killTweensOf(this.honkBtn.t);
			this.honkBtn.t.setScale(1);
		}
	}
	cycleMusic() {
		resumeAudio();
		if (!G.musicOn) {
			G.musicOn = true;
			G.track = 0;
		} else {
			G.track = (G.track || 0) + 1;
			if (G.track >= TRACKS.length) {
				G.musicOn = false;
				G.track = 0;
			}
		}
		G.save();
		if (G.musicOn) {
			_mStep = 0;
			startMusic();
			this.musicBtn.setText("🎵");
			this.musicName(curTrack().name);
		} else {
			this.musicBtn.setText("🔈");
			this.musicName("🔇 Music off");
		}
	}
	musicName(txt) {
		if (this._mn) this._mn.destroy();
		this._mn = this.add
			.text(GW - 20, 76, txt, {
				fontFamily: "Fredoka One",
				fontSize: fz(0.026),
				color: "#ffffff",
				stroke: "#1e1440",
				strokeThickness: 4,
			})
			.setOrigin(1, 0)
			.setScrollFactor(0)
			.setDepth(2600);
		this.tweens.add({
			targets: this._mn,
			alpha: 0,
			delay: 1300,
			duration: 500,
			onComplete: () => {
				this._mn && this._mn.destroy();
				this._mn = null;
			},
		});
	}
	updateTrail() {
		const g = this.trailG;
		if (!g) return;
		g.clear();
		if (!this.target || !this.carrying) return;
		if (!this.trailPts || this.time.now - (this._trailT || 0) > 180) {
			this.trailPts = roadRoute(
				this.van.x,
				this.van.y,
				this.target.door.x,
				this.target.door.y,
			);
			this._trailT = this.time.now;
		}
		const pts = this.trailPts;
		if (!pts || pts.length < 2) return;
		let carry = (this.time.now / 240) % 42;
		for (let s = 0; s < pts.length - 1; s++) {
			const a = pts[s],
				b = pts[s + 1],
				len = Math.hypot(b.x - a.x, b.y - a.y);
			if (len < 1) continue;
			const ux = (b.x - a.x) / len,
				uy = (b.y - a.y) / len;
			let d = carry;
			while (d < len) {
				const px = a.x + ux * d,
					py = a.y + uy * d;
				g.fillStyle(this.target.hex, 0.7).fillCircle(px, py, 7);
				g.fillStyle(0xffffff, 0.5).fillCircle(px, py, 3);
				d += 42;
			}
			carry = d - len;
		}
	}
	glowPulse() {
		if (!this.target || !this.glow.visible) return;
		const p = 0.5 + 0.5 * Math.sin(this.time.now / 250);
		const R = this.target.w * (1 + p * 0.18);
		this.glow
			.setPosition(this.target.x, this.target.y)
			.setSize(R * 2, R * 2)
			.setDepth(this.target.y - 1)
			.setAlpha(0.3 + p * 0.3);
	}
	drawHeadlights() {
		const g = this.headG;
		g.clear();
		if (this.night.fillAlpha < 0.22) {
			return;
		}
		const v = this.van,
			hx = v.x + Math.cos(this.heading) * 18,
			hy = v.y + Math.sin(this.heading) * 18;
		const a = this.heading,
			spread = 0.4,
			len = 150;
		g.setDepth(v.y - 0.5);
		g.fillStyle(0xfff3b0, 0.16);
		g.fillTriangle(
			hx,
			hy,
			hx + Math.cos(a - spread) * len,
			hy + Math.sin(a - spread) * len,
			hx + Math.cos(a + spread) * len,
			hy + Math.sin(a + spread) * len,
		);
	}
	drawTurboRing() {
		const g = this.turboRing;
		if (!this.turboBtn) return;
		g.clear();
		const b = this.turboBtn;
		g.lineStyle(4, 0x000000, 0.25).strokeCircle(b.x, b.y, b.r + 3);
		g.lineStyle(4, C.orange, 0.95);
		g.beginPath();
		g.arc(
			b.x,
			b.y,
			b.r + 3,
			-Math.PI / 2,
			-Math.PI / 2 + Math.PI * 2 * this.turbo,
			false,
		);
		g.strokePath();
	}
	drawJoystick() {
		const g = this.dragG;
		g.clear();
		if (!this.drag.active) return;
		const ox = this.drag.ox,
			oy = this.drag.oy;
		g.fillStyle(C.card, 0.35).fillCircle(ox, oy, 58);
		g.lineStyle(3, 0xffffff, 0.35).strokeCircle(ox, oy, 58);
		const kx = ox + Math.cos(this.drag.ang) * 58 * this.drag.mag,
			ky = oy + Math.sin(this.drag.ang) * 58 * this.drag.mag;
		g.fillStyle(C.pink, 0.95).fillCircle(kx, ky, 26);
		g.lineStyle(3, C.purple, 1).strokeCircle(kx, ky, 26);
	}
	drawSpeedLines() {
		const g = this.boostG;
		g.clear();
		if (this.boostT <= 0) return;
		g.lineStyle(3, 0xffffff, 0.5);
		for (let i = 0; i < 10; i++) {
			const a = Math.random() * Math.PI * 2,
				r1 = GW * 0.3 + Math.random() * 60,
				r2 = r1 + 40 + Math.random() * 40;
			g.lineBetween(
				GW / 2 + Math.cos(a) * r1,
				GH / 2 + Math.sin(a) * r1,
				GW / 2 + Math.cos(a) * r2,
				GH / 2 + Math.sin(a) * r2,
			);
		}
	}
	updateRain(dt) {
		const g = this.rainG;
		g.clear();
		if (!this.rainOn) return;
		if (this.rain.length < 90)
			for (let i = 0; i < 4; i++)
				this.rain.push({
					x: Math.random() * GW,
					y: Math.random() * -GH,
					sp: 600 + Math.random() * 300,
				});
		g.lineStyle(2, 0x9fd8ff, 0.5);
		this.rain.forEach((d) => {
			d.y += d.sp * dt;
			d.x -= 80 * dt;
			if (d.y > GH) {
				d.y = -10;
				d.x = Math.random() * GW + 80;
			}
			g.lineBetween(d.x, d.y, d.x - 6, d.y + 14);
		});
	}
	drawMinimap() {
		if (!this.mmG)
			this.mmG = this.add.graphics().setScrollFactor(0).setDepth(1600);
		const M = Math.min(112, GW * 0.28),
			pad = 14,
			x0 = GW - M - pad,
			y0 = 64,
			sc = M / WORLD,
			g = this.mmG;
		g.clear();
		this.mmRect = { x0, y0, M, sc };
		g.fillStyle(C.card, 0.72).fillRoundedRect(
			x0 - 6,
			y0 - 6,
			M + 12,
			M + 12,
			12,
		);
		g.lineStyle(1.5, C.cardB, 1).strokeRoundedRect(
			x0 - 6,
			y0 - 6,
			M + 12,
			M + 12,
			12,
		);
		this.houses.forEach((h) => {
			g.fillStyle(h.delivered ? 0xffffff : h.hex, h.delivered ? 0.3 : 1);
			g.fillCircle(x0 + h.x * sc, y0 + h.y * sc, h === this.target ? 5 : 3);
		});
		g.fillStyle(C.yellow, 1).fillRect(
			x0 + this.depot.x * sc - 3,
			y0 + this.depot.y * sc - 3,
			6,
			6,
		);
		g.fillStyle(C.pink, 1).fillCircle(
			x0 + this.van.x * sc,
			y0 + this.van.y * sc,
			4,
		);
	}
	drawArrow() {
		if (!this.arrowG) {
			this.arrowG = this.add.graphics().setScrollFactor(0).setDepth(1700);
			this.arrowEmo = this.add
				.text(0, 0, "", { fontSize: "24px" })
				.setOrigin(0.5)
				.setScrollFactor(0)
				.setDepth(1701);
		}
		const g = this.arrowG;
		g.clear();
		this.arrowEmo.setVisible(false);
		if (!this.target || !this.carrying) return;
		const sx = this.target.door.x - this.cameras.main.scrollX,
			sy = this.target.door.y - this.cameras.main.scrollY,
			m = 72;
		if (sx > m && sx < GW - m && sy > m + 30 && sy < GH - m) return;
		const cx = GW / 2,
			cy = GH / 2,
			a = Math.atan2(sy - cy, sx - cx);
		let ex = Phaser.Math.Clamp(cx + Math.cos(a) * (GW / 2 - m), m, GW - m),
			ey = Phaser.Math.Clamp(cy + Math.sin(a) * (GH / 2 - m), m + 30, GH - m);
		g.fillStyle(this.target.hex, 1);
		g.fillTriangle(
			ex + Math.cos(a) * 20,
			ey + Math.sin(a) * 20,
			ex + Math.cos(a + 2.5) * 16,
			ey + Math.sin(a + 2.5) * 16,
			ex + Math.cos(a - 2.5) * 16,
			ey + Math.sin(a - 2.5) * 16,
		);
		this.arrowEmo
			.setVisible(true)
			.setPosition(ex, ey)
			.setText(this.target.emoji);
	}
}

/* ═══════════ WIN ═══════════ */
class WinScene extends Phaser.Scene {
	constructor() {
		super("Win");
	}
	create(data) {
		const party = data && data.party;
		const cx = GW / 2;
		this.cameras.main.setBackgroundColor("#0f0a1e");
		this.add.rectangle(cx, GH / 2, GW, GH, C.bg, 0.6);
		sfx.win();
		const cols = [C.pink, C.yellow, C.green, C.blue, C.purple, C.orange];
		for (let i = 0; i < 70; i++) {
			const c = this.add.rectangle(
				Phaser.Math.Between(0, GW),
				-20,
				8,
				8,
				Phaser.Utils.Array.GetRandom(cols),
			);
			this.tweens.add({
				targets: c,
				y: GH + 30,
				angle: Phaser.Math.Between(180, 720),
				x: c.x + Phaser.Math.Between(-60, 60),
				duration: Phaser.Math.Between(1600, 3200),
				delay: Phaser.Math.Between(0, 1200),
				repeat: -1,
				ease: "Quad.in",
			});
		}
		const trophy = this.add
			.text(cx, GH * 0.22, party ? "🎉" : "🏆", { fontSize: fz(0.15) })
			.setOrigin(0.5);
		this.tweens.add({
			targets: trophy,
			y: GH * 0.22 - 14,
			duration: 1300,
			yoyo: true,
			repeat: -1,
			ease: "Sine.inOut",
		});
		this.add
			.text(cx, GH * 0.4, party ? "Party Success! 🎈" : "Route Complete!", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.07),
				color: HX.green,
				stroke: "#0f0a1e",
				strokeThickness: 6,
			})
			.setOrigin(0.5);
		const tips = G.tipsEarned || 0;
		const stars = tips >= 180 ? 3 : tips >= 120 ? 2 : 1;
		if (stars > G.bestStars) {
			G.bestStars = stars;
			G.save();
		}
		this.add
			.text(cx, GH * 0.52, "⭐".repeat(stars) + "☆".repeat(3 - stars), {
				fontSize: fz(0.075),
			})
			.setOrigin(0.5);
		const msg =
			stars === 3
				? "Speedy AND careful — superstar driver! 🏎️💨"
				: stars === 2
					? "Awesome route! Everyone's so happy! 💕"
					: "All delivered! Slow and steady. 🐢";
		this.add
			.text(cx, GH * 0.62, msg, {
				fontFamily: "Nunito",
				fontStyle: "900",
				fontSize: fz(0.03),
				color: HX.muted,
				align: "center",
				wordWrap: { width: GW * 0.82 },
			})
			.setOrigin(0.5);
		this.add
			.text(
				cx,
				GH * 0.7,
				"🪙 " + G.coins + " coins  ·  +" + tips + " this route",
				{ fontFamily: "Fredoka One", fontSize: fz(0.034), color: HX.yellow },
			)
			.setOrigin(0.5);
		if (G.smashCount > 0)
			this.add
				.text(cx, GH * 0.76, "💥 " + G.smashCount + " things bonked!", {
					fontFamily: "Fredoka One",
					fontSize: fz(0.03),
					color: HX.orange,
				})
				.setOrigin(0.5);
		makeBtn(
			this,
			cx - GW * 0.21,
			GH * 0.85,
			"Drive Again 🚐",
			C.pink,
			"#ffffff",
			fz(0.036),
			() => this.scene.start("Play"),
			C.purple,
		);
		makeBtn(
			this,
			cx + GW * 0.21,
			GH * 0.85,
			"🚙 Garage",
			C.card,
			HX.text,
			fz(0.036),
			() => this.scene.start("Garage"),
			C.cardB,
		);
	}
}

/* ── button factories ── */
function makeBtn(scene, x, y, label, fill, textCol, fontSize, cb, stroke) {
	const fsNum = parseFloat(String(fontSize)) || 24;
	const w = Math.max(label.length * fsNum * 0.5 + 44, 150),
		h = fsNum * 1.7 + 18;
	const shadow = scene.add.graphics().setScrollFactor(0).setDepth(2499);
	shadow
		.fillStyle(0x000000, 0.3)
		.fillRoundedRect(x - w / 2, y - h / 2 + 6, w, h, h / 2);
	const g = scene.add.graphics().setScrollFactor(0).setDepth(2500);
	g.fillStyle(fill, 1).fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
	if (stroke != null)
		g.lineStyle(3, stroke, 0.6).strokeRoundedRect(
			x - w / 2,
			y - h / 2,
			w,
			h,
			h / 2,
		);
	const txt = scene.add
		.text(x, y, label, { fontFamily: "Fredoka One", fontSize, color: textCol })
		.setOrigin(0.5)
		.setScrollFactor(0)
		.setDepth(2501);
	const hit = scene.add
		.rectangle(x, y, w, h, 0xffffff, 0.001)
		.setScrollFactor(0)
		.setDepth(2502)
		.setInteractive({ useHandCursor: true });
	hit.on("pointerdown", () => {
		g.y = 3;
		txt.y = y + 3;
	});
	hit.on("pointerup", () => {
		g.y = 0;
		txt.y = y;
		cb && cb();
	});
	hit.on("pointerout", () => {
		g.y = 0;
		txt.y = y;
	});
	return hit;
}
function holdBtn(scene, x, y, w, h, label, key, owner, big) {
	const r = big ? w / 2 : Math.min(24, w * 0.3);
	const g = scene.add.graphics().setScrollFactor(0).setDepth(1900);
	function draw(held) {
		g.clear();
		g.fillStyle(0x000000, 0.28).fillRoundedRect(
			x - w / 2,
			y - h / 2 + (held ? 2 : 6),
			w,
			h,
			r,
		);
		g.fillStyle(
			held ? (big ? C.green : C.pink) : big ? C.green : C.card,
			held ? (big ? 1 : 0.7) : big ? 1 : 0.62,
		);
		g.fillRoundedRect(x - w / 2, y - h / 2 + (held ? 5 : 0), w, h, r);
		g.lineStyle(2, 0xffffff, 0.18).strokeRoundedRect(
			x - w / 2,
			y - h / 2 + (held ? 5 : 0),
			w,
			h,
			r,
		);
	}
	draw(false);
	const txt = scene.add
		.text(x, y, label, {
			fontFamily: "Fredoka One",
			fontSize: big ? fz(0.03) : fz(0.036),
			color: big ? "#0f2a1e" : "#ffffff",
		})
		.setOrigin(0.5)
		.setScrollFactor(0)
		.setDepth(1901);
	const hit = scene.add
		.rectangle(x, y, w, h, 0xffffff, 0.001)
		.setScrollFactor(0)
		.setDepth(1902)
		.setInteractive();
	const on = () => {
		owner.ctl[key] = true;
		draw(true);
		txt.y = y + 5;
		resumeAudio();
		if (owner.clearDest) owner.clearDest();
		if (!owner.driving) owner.startDriving();
	};
	const off = () => {
		owner.ctl[key] = false;
		draw(false);
		txt.y = y;
	};
	hit.on("pointerdown", on);
	hit.on("pointerup", off);
	hit.on("pointerout", off);
	owner.ctlRects.push({ x, y, w, h });
	return hit;
}

/* ═══════════ SCRAPBOOK — Letters from Dad ═══════════ */
class ScrapbookScene extends Phaser.Scene {
	constructor() {
		super("Scrapbook");
	}
	create() {
		G.load();
		const cx = GW / 2,
			seen = G.lettersSeen || [];
		this.cameras.main.setBackgroundColor("#0f0a1e");
		this.add.rectangle(cx, GH * 0.82, GW, GH * 0.42, C.grass, 0.1);
		this.add
			.text(cx, GH * 0.08, "📖 Letters from Dad", {
				fontFamily: "Fredoka One",
				fontSize: fz(0.05),
				color: HX.pink,
				stroke: "#0f0a1e",
				strokeThickness: 5,
			})
			.setOrigin(0.5);
		this.add
			.text(
				cx,
				GH * 0.15,
				seen.length + " / " + DAD_NOTES.length + " collected 💌",
				{ fontFamily: "Fredoka One", fontSize: fz(0.032), color: HX.yellow },
			)
			.setOrigin(0.5);

		const cols = 4,
			rows = Math.ceil(DAD_NOTES.length / cols);
		const availW = GW * 0.88,
			availH = GH * 0.56;
		const cellW = availW / cols,
			cellH = availH / rows;
		const cw = Math.min(cellW, cellH) * 0.84;
		const sy = GH * 0.25;
		for (let i = 0; i < DAD_NOTES.length; i++) {
			const col = i % cols,
				row = Math.floor(i / cols);
			const rowCount = Math.min(cols, DAD_NOTES.length - row * cols); // center a short last row
			const x = cx - ((rowCount - 1) * cellW) / 2 + col * cellW,
				y = sy + row * cellH;
			const isSeen = seen.indexOf(i) >= 0;
			const g = this.add.graphics().setDepth(10);
			g.fillStyle(0x000000, 0.3).fillRoundedRect(
				x - cw / 2,
				y - cw / 2 + 4,
				cw,
				cw,
				14,
			);
			g.fillStyle(isSeen ? C.card : 0x171127, 1).fillRoundedRect(
				x - cw / 2,
				y - cw / 2,
				cw,
				cw,
				14,
			);
			g.lineStyle(
				2,
				isSeen ? C.pink : 0x33284d,
				isSeen ? 0.85 : 0.6,
			).strokeRoundedRect(x - cw / 2, y - cw / 2, cw, cw, 14);
			this.add
				.text(x, y, isSeen ? "💌" : "🔒", {
					fontSize: Math.round(cw * 0.46) + "px",
				})
				.setOrigin(0.5)
				.setDepth(11)
				.setAlpha(isSeen ? 1 : 0.45);
			if (isSeen) {
				const hit = this.add
					.rectangle(x, y, cw, cw, 0xffffff, 0.001)
					.setDepth(12)
					.setInteractive({ useHandCursor: true });
				hit.on("pointerdown", () => {
					g.y = 3;
				});
				hit.on("pointerout", () => {
					g.y = 0;
				});
				hit.on("pointerup", () => {
					g.y = 0;
					this.openLetter(i);
				});
			}
		}
		if (seen.length === 0) {
			this.add
				.text(
					cx,
					GH * 0.82,
					"Deliver Dad's special 💌 packages to collect his letters!",
					{
						fontFamily: "Nunito",
						fontStyle: "900",
						fontSize: fz(0.028),
						color: HX.muted,
						align: "center",
						wordWrap: { width: GW * 0.8 },
					},
				)
				.setOrigin(0.5)
				.setDepth(20);
		}
		makeBtn(
			this,
			cx,
			GH * 0.93,
			"← Back",
			C.card,
			HX.text,
			fz(0.034),
			() => this.scene.start("Menu"),
			C.cardB,
		);
	}
	openLetter(i) {
		const cx = GW / 2,
			cy = GH / 2;
		const dim = this.add
			.rectangle(cx, cy, GW, GH, 0x000000, 0.66)
			.setDepth(3000)
			.setInteractive();
		const cardW = Math.min(GW * 0.84, 560),
			cardH = Math.min(GH * 0.5, GW * 0.7, 420);
		const g = this.add.graphics().setDepth(3001);
		g.fillStyle(C.card, 1).fillRoundedRect(
			cx - cardW / 2,
			cy - cardH / 2,
			cardW,
			cardH,
			22,
		);
		g.lineStyle(3, C.pink, 0.7).strokeRoundedRect(
			cx - cardW / 2,
			cy - cardH / 2,
			cardW,
			cardH,
			22,
		);
		const head = this.add
			.text(cx, cy - cardH / 2 + 16, "💌", { fontSize: fz(0.075) })
			.setOrigin(0.5, 0)
			.setDepth(3002);
		const body = this.add
			.text(cx, cy + 6, DAD_NOTES[i], {
				fontFamily: "Fredoka One",
				fontSize: fz(0.044),
				color: HX.text,
				align: "center",
				wordWrap: { width: cardW * 0.82 },
			})
			.setOrigin(0.5)
			.setDepth(3002);
		const hint = this.add
			.text(cx, cy + cardH / 2 - 24, "tap to close 💕", {
				fontFamily: "Nunito",
				fontStyle: "900",
				fontSize: fz(0.026),
				color: HX.pink,
			})
			.setOrigin(0.5)
			.setDepth(3002);
		body.setScale(0.7).setAlpha(0);
		this.tweens.add({
			targets: body,
			scale: 1,
			alpha: 1,
			duration: 220,
			ease: "Back.out",
		});
		const close = () => {
			dim.destroy();
			g.destroy();
			head.destroy();
			body.destroy();
			hint.destroy();
		};
		dim.on("pointerup", close);
	}
}

/* ── launch ── */
window.__game = new Phaser.Game({
	type: Phaser.AUTO,
	width: GW,
	height: GH,
	backgroundColor: "#0f0a1e",
	parent: "game-container",
	physics: {
		default: "arcade",
		arcade: { gravity: { x: 0, y: 0 }, debug: false },
	},
	scene: [MenuScene, GarageScene, PlayScene, WinScene, ScrapbookScene],
	scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
	input: { touch: true, activePointers: 3 },
});

/* ── fill the screen on resize / rotate / fullscreen; re-lay-out the active scene ── */
function applyResize(w, h) {
	const nw = Math.max(320, Math.round(w)),
		nh = Math.max(240, Math.round(h));
	if (Math.abs(nw - GW) < 24 && Math.abs(nh - GH) < 24) return;
	GW = nw;
	GH = nh;
	const game = window.__game;
	if (!game) return;
	game.scene.getScenes(true).forEach((sc) => {
		if (sc.scene.key === "Play" && sc.driving) {
			sc.scene.restart(sc.snapshot());
		} else {
			sc.scene.restart();
		}
	});
}
let _rzT = null;
window.__game.scale.on("resize", (gameSize) => {
	clearTimeout(_rzT);
	_rzT = setTimeout(() => applyResize(gameSize.width, gameSize.height), 180);
});
function toggleFullscreen() {
	const s = window.__game && window.__game.scale;
	if (!s) return;
	try {
		if (s.isFullscreen) s.stopFullscreen();
		else s.startFullscreen();
	} catch (e) {}
}

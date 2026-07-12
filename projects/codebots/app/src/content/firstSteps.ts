import type { Mission } from "../sim/engine";
import type { Arena, CellKind } from "../sim/types";

/**
 * FIRST STEPS — a storybook for a kid who has never written a line of code.
 *
 * What was wrong before: the game's first screen was an IDE — concept card, briefing, command
 * reference, arena key, rules panel, HUD, radio log, text editor. Nine regions, ~200 words, and then
 * "cross this field of crates". But the deeper problem was quieter and worse: NOTHING WAS EVER
 * EXPLAINED. It showed a kid `forward(3)` and moved on. It never said what code IS. It never said
 * what a command is, or why there are two brackets stuck on the end, or what the number inside them
 * does, or why a capital F breaks everything. Every one of those is a genuine concept, and we were
 * smuggling all five past her inside a single line of text and hoping she'd absorb them.
 *
 * She didn't. Nobody would. An adult wouldn't.
 *
 * So: ONE idea per beat. Each beat explains the thing in plain words, then has her DO that one thing,
 * and the robot responds immediately. Nothing is introduced before it's needed, and nothing is used
 * before it's introduced.
 *
 * THE ORDER, and why:
 *   1. what code even is        — a robot can't think; it follows instructions. That's all code is.
 *   2. a command is a word      — `forward` is a word the robot knows.
 *   3. brackets mean DO IT      — a word on its own is a button nobody pressed. () presses it.
 *   4. numbers go inside        — the brackets are also where you put "how many".
 *   5. CAPITALS are different   — the exact thing a real 9-year-old broke on, taught by breaking it.
 *   6. a program is a LIST      — more than one line, done in order, top to bottom.
 *   7. the robot is LITERAL     — we crash it into a wall on purpose. That lesson sticks; a panel doesn't.
 *   8. turns are the robot's    — left() is ITS left, not yours.
 *   9. now type it yourself     — the keyboard arrives LAST, once she knows what the words mean.
 *
 * She TAPS instead of typing (until beat 9). A six-year-old cannot type `forward(3)`: the brackets
 * are a wall and camelCase is a wall behind it. So she taps, and the game writes the JavaScript in
 * front of her — real code, exactly what a programmer writes, without the keyboard fight. Typing is a
 * separate skill from thinking, and making her learn both at once is how we lose her.
 *
 * And she CANNOT FAIL here. No stars, no par, no armor, no score, no timer. A wrong answer gets a
 * nudge and another go, and nothing is ever taken away.
 */

/** A chip she taps. Commands and numbers — that is the entire vocabulary. */
export interface Chip {
  label: string;
  /** what tapping it adds to her program */
  emit: string;
  /** a number chip goes INSIDE the brackets of the command before it */
  kind: "command" | "number";
}

export interface FirstStep {
  id: string;
  /** the idea being taught, in three words */
  title: string;
  /** The explanation. Short lines, plain words, read aloud without running out of breath.
   *  This is the part that was missing entirely. */
  teach: string[];
  /** a snippet to look AT while she reads — never more than she's been taught */
  show?: string;
  /** the ONE thing to do now */
  task: string;
  /** lane length; the flag sits at the end unless the step says otherwise */
  lane: number;
  chips: Chip[];
  /** a program we hand her already written (used to make a point she can see) */
  prefill?: string;
  /** shown when the robot doesn't get there. Never scolds — it's never her fault. */
  nudge: string;
  /** shown when it works. Names the idea she just proved. */
  praise: string;
  /** on this beat she uses the keyboard */
  typing?: boolean;
  /**
   * Show the command as a BARE WORD, with no brackets.
   *
   * Beat 2's whole claim is "a word on its own is just a word — a button nobody pressed", and beat 3
   * pays it off by adding the brackets. If beat 2 quietly wrote `forward()` for her, it would prove
   * the opposite of what it says: the robot would move, and the brackets would look like decoration.
   * So beat 2 really does put a bare `forward` in her program, and pressing GO really does nothing.
   * The lesson is the silence.
   */
  bare?: boolean;
}

const cmd = (label: string): Chip => ({ label, emit: label, kind: "command" });
const num = (n: number): Chip => ({ label: String(n), emit: String(n), kind: "number" });

export const FIRST_STEPS: FirstStep[] = [
  {
    id: "what-is-code",
    title: "WHAT IS CODE?",
    teach: [
      "This is Sparkplug. It's a robot, and robots can't think.",
      "It will never guess what you want. It only does what it is TOLD.",
      "Writing those instructions down is called CODE. That's all code is: telling a machine exactly what to do.",
    ],
    task: "Sparkplug has no instructions yet. Press GO and see what happens.",
    lane: 2,
    chips: [],
    // the point of this beat: NOTHING happens. An empty program does nothing at all.
    prefill: "",
    nudge: "Press GO. (Nothing will happen — that's the lesson.)",
    praise: "Nothing happened. No instructions, no moving. Now let's give it some.",
  },
  {
    id: "a-command",
    title: "A WORD IT KNOWS",
    teach: [
      "Sparkplug knows a few special words. Each one makes it do something.",
      "One of them is: forward",
      "A word that DOES something is called a COMMAND.",
    ],
    show: "forward",
    task: "Tap the forward chip to put that word in your program — then press GO.",
    lane: 1,
    bare: true,
    chips: [cmd("forward")],
    nudge: "Tap the word forward, then press GO.",
    praise: "Nothing moved! The word is in there, but nothing happened. Next: why.",
  },
  {
    id: "brackets",
    title: "BRACKETS MEAN GO",
    teach: [
      "A word on its own is like a button nobody pressed. It just sits there.",
      "The two brackets () are how you PRESS it.",
      "forward() means: do the forward thing, now.",
    ],
    show: "forward()",
    task: "Your program already says forward(). Press GO and watch it roll one square.",
    prefill: "forward()",
    lane: 1,
    chips: [cmd("forward")],
    nudge: "Press GO — the program is ready.",
    praise: "It moved! The brackets are what pressed the button.",
  },
  {
    id: "numbers",
    title: "THE NUMBER INSIDE",
    teach: [
      "The brackets are also a little box you can put something IN.",
      "Put a number in, and it means HOW MANY.",
      "forward(3) means: roll forward three squares.",
    ],
    show: "forward(3)",
    task: "The flag is 3 squares away. Tap forward, then tap 3.",
    lane: 3,
    chips: [cmd("forward"), num(1), num(2), num(3)],
    nudge: "Count the squares to the flag — that's the number that goes in the brackets.",
    praise: "One command did three squares. The number did the counting for you.",
  },
  {
    id: "capitals",
    title: "BIG F, SMALL F",
    teach: [
      "Here's a strange one, and it catches everybody.",
      "To a robot, Forward and forward are two COMPLETELY different words.",
      "A big F is not the same letter as a small f. It only knows the small one.",
    ],
    show: "Forward(2)   ✗\nforward(2)   ✓",
    task: "I wrote it with a big F, so it's broken. Press GO to see — then fix it.",
    prefill: "Forward(2)",
    lane: 2,
    chips: [cmd("forward"), num(1), num(2)],
    nudge: 'The robot doesn\'t know "Forward" with a big F. Build it again with the small one.',
    praise: "That's it. Computers are fussy about capital letters — now you know before it bites you.",
  },
  {
    id: "a-list",
    title: "A LIST OF STEPS",
    teach: [
      "A program can have more than one line.",
      "The robot reads them like a list — top line first, then the next.",
      "It never skips ahead and never changes the order.",
    ],
    show: "forward(2)\nhonk()",
    task: "Roll forward 2, and then HONK. Two lines, in that order.",
    lane: 2,
    chips: [cmd("forward"), cmd("honk"), num(1), num(2)],
    nudge: "First line: forward 2. Second line: honk.",
    praise: "In order, top to bottom. That's what a program IS — a list of steps.",
  },
  {
    id: "literal",
    title: "IT DOESN'T CHECK",
    teach: [
      "Now the most important thing in this whole game.",
      "The robot never checks whether you're right. It doesn't know what you MEANT.",
      "It just does what you wrote — even if what you wrote is silly.",
    ],
    show: "forward(9)",
    task: "The flag is 3 away, but I wrote 9. Press GO and watch what happens.",
    prefill: "forward(9)",
    lane: 3,
    chips: [cmd("forward"), num(1), num(2), num(3)],
    nudge: "It drove straight into the wall, because that's what the program said. Now fix it — roll 3.",
    praise: "It crashed because YOU told it to. Not because it's dumb. Your code is the whole brain.",
  },
  {
    id: "turn",
    title: "ITS LEFT, NOT YOURS",
    teach: [
      "left() turns the robot. But careful — it turns to ITS OWN left.",
      "Not the left side of your screen. Imagine you're sitting in the robot.",
      "It's facing right, so its left is UP.",
    ],
    show: "forward(2)\nleft()\nforward(1)",
    task: "The flag is off the lane. Roll 2, turn left, then roll 1.",
    lane: 2,
    chips: [cmd("forward"), cmd("left"), cmd("right"), num(1), num(2)],
    nudge: "Three lines: forward 2, then left, then forward 1.",
    praise: "You steered it without ever touching it. You wrote the turn INTO the program.",
  },
  {
    id: "type-it",
    title: "NOW YOU WRITE IT",
    teach: [
      "You've been tapping. Real programmers type it out.",
      "You already know every part: the word, the brackets, the number, the small letters.",
      "Nothing new here — just you doing it.",
    ],
    show: "forward(3)",
    task: "Type it yourself: forward(3)",
    lane: 3,
    typing: true,
    chips: [],
    nudge: 'Small "f". Then ( then 3 then ). Take your time.',
    praise: "That is real JavaScript. The same code grown-up programmers write. You're ready for Level 1.",
  },
];

/** A beat's world: a short lane and a flag. No crates, no mud, no score. Nothing to read but the robot. */
export function stepMission(step: FirstStep): Mission {
  const turning = step.id === "turn";
  const rows = turning ? 4 : 3;
  const row = turning ? 2 : 1;
  const cols = step.lane + 1 + 2; // run-off, so overshooting is visibly overshooting
  const cells: CellKind[][] = Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor"));
  const beacon = turning ? { x: 2, y: row - 1 } : { x: step.lane, y: row };
  const arena: Arena = { cols, rows, cells, crates: [], coins: [], chests: [], gates: [], targets: [], beacon };
  return {
    id: `first-${step.id}`,
    world: 1,
    index: 0,
    title: step.title,
    teaches: "first steps",
    arena,
    start: { pos: { x: 0, y: row }, facing: "E" },
    parLines: 99, // there is no par here. She might be six.
    starterCode: "",
    hints: [step.nudge, step.nudge, step.nudge],
    briefing: step.teach.join(" "),
    authorSolution: "",
    bonusStar: { kind: "zeroBumps" },
  };
}

/**
 * Did the beat land?
 *
 * Most beats ask her to park on the flag. Two do not, and they're the two that teach by FAILING:
 * "what is code" (an empty program does nothing, and seeing nothing happen IS the lesson) and the
 * first pass of the broken ones. Those pass on the attempt itself, so the story can move on.
 */
export function stepDone(step: FirstStep, finalPos: { x: number; y: number }): boolean {
  if (step.id === "what-is-code" || step.id === "a-command") return true; // nothing to reach; the point is made by trying
  const m = stepMission(step);
  return finalPos.x === m.arena.beacon.x && finalPos.y === m.arena.beacon.y;
}

#!/usr/bin/env node

const repl = require("repl");
const readline = require("readline");

// Create a custom REPL
const r = repl.start({
	prompt: "> ",
	eval: (cmd, context, filename, callback) => {
		// Handle the clear command
		if (cmd.trim() === "clear" || cmd.trim() === ".clear") {
			console.clear();
			callback(null, undefined);
			return;
		}

		// Default evaluation
		try {
			const result = eval(cmd);
			callback(null, result);
		} catch (err) {
			callback(err);
		}
	},
});

// Set up Command+K (Ctrl+K) to clear screen
r.input.on("keypress", (str, key) => {
	if (key && key.ctrl && key.name === "k") {
		console.clear();
		r.displayPrompt();
	}
});

console.log("Node.js REPL with Command+K support");
console.log("Press Command+K to clear screen, or type .exit to quit");

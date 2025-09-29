// src/theme.ts
import { createSystem, defaultConfig } from "@chakra-ui/react";

export const theme = createSystem(defaultConfig, {
	tokens: {
		fonts: {
			heading: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
			body: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
			mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
		},
		colors: {
			brand: {
				50: "#eef6ff",
				600: "#2563eb",
				700: "#1d4ed8",
			},
		},
	},
	globalCss: {
		"*": {
			_hover: { textDecoration: "none" },
		},
	},
});

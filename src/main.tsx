// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

// Only run on client side
if (typeof document !== "undefined") {
	const rootElement = document.getElementById("root");
	if (rootElement) {
		createRoot(rootElement).render(
			<ChakraProvider value={defaultSystem}>
				<RouterProvider router={router} />
			</ChakraProvider>
		);
	}
}

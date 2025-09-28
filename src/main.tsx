// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Only run on client side
if (typeof document !== "undefined") {
	console.log("Starting app...");
	const rootElement = document.getElementById("root");
	if (rootElement) {
		console.log("Root element found, rendering app...");
		try {
			createRoot(rootElement).render(
				<ChakraProvider value={defaultSystem}>
					<RouterProvider router={router} />
				</ChakraProvider>
			);
			console.log("App rendered successfully");
		} catch (error) {
			console.error("Failed to render app:", error);
			rootElement.innerHTML = `
				<div style="padding: 20px; font-family: Arial, sans-serif;">
					<h1>Error Loading Blog</h1>
					<p>There was an error loading the blog. Please check the console for details.</p>
					<p>Error: ${error.message}</p>
				</div>
			`;
		}
	} else {
		console.error("Root element not found");
	}
} else {
	console.log("Not in browser environment, skipping app initialization");
}

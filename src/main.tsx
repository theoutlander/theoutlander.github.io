// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ 
	routeTree,
	defaultPreload: 'intent',
});

// Only run on client side
if (typeof document !== "undefined") {
	console.log("Starting app initialization...");
	const rootElement = document.getElementById("root");
	if (rootElement) {
		console.log("Root element found, rendering app...");
		try {
			// Test with a simple component first
			createRoot(rootElement).render(
				<div style="padding: 20px; font-family: Arial, sans-serif;">
					<h1>Blog Test</h1>
					<p>If you see this, React is working!</p>
					<button onClick={() => {
						console.log("Button clicked!");
						// Now try to render the full app
						createRoot(rootElement).render(
							<ChakraProvider value={defaultSystem}>
								<RouterProvider router={router} />
							</ChakraProvider>
						);
					}}>
						Load Full App
					</button>
				</div>
			);
			console.log("Test component rendered successfully");
		} catch (error) {
			console.error("Failed to render app:", error);
			rootElement.innerHTML = `
				<div style="padding: 20px; font-family: Arial, sans-serif;">
					<h1>Error Loading Blog</h1>
					<p>There was an error loading the blog. Please refresh the page.</p>
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

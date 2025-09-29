import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { routeTree } from "./routeTree.gen";
// import { theme } from "./theme";

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
				React.createElement(
					HelmetProvider,
					null,
					React.createElement(ChakraProvider, {
						value: defaultSystem,
						children: React.createElement(RouterProvider, { router }),
					})
				)
			);
			console.log("App rendered successfully");
		} catch (error) {
			console.error("Failed to render app:", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			rootElement.innerHTML = `
				<div style="padding: 20px; font-family: Arial, sans-serif;">
					<h1>Error Loading Blog</h1>
					<p>There was an error loading the blog. Please check the console for details.</p>
					<p>Error: ${errorMessage}</p>
				</div>
			`;
		}
	} else {
		console.error("Root element not found");
	}
} else {
	console.log("Not in browser environment, skipping app initialization");
}

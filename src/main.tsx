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
		try {
			createRoot(rootElement).render(
				<ChakraProvider value={defaultSystem}>
					<RouterProvider router={router} />
				</ChakraProvider>
			);
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
}

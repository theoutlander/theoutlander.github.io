import React from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { HelmetProvider } from "./components/seo/HelmetShim";
import { routeTree } from "./routeTree.gen";
import "../styled-system/styles.css";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	// Handle GitHub Pages SPA redirect
	context: {
		// This will be set by the redirect script
		redirectPath: undefined as string | undefined,
	},
});

// Add debugging
router.subscribe("onLoad", ({ pathname, routeId }) => {
	console.log("Route loaded:", pathname, routeId);
});

router.subscribe("onError", ({ error, pathname }) => {
	console.error("Route error:", error, pathname);
});

// Handle GitHub Pages SPA redirect
if (typeof window !== "undefined") {
	// Check if we're coming from a GitHub Pages 404 redirect
	const urlParams = new URLSearchParams(window.location.search);
	const redirectPath = urlParams.get("/");

	if (redirectPath) {
		// Clean up the URL and navigate to the correct path
		const cleanPath = redirectPath.replace(/~and~/g, "&");
		window.history.replaceState({}, "", cleanPath);
		// Navigate to the correct route
		router.navigate({ to: cleanPath });
	}
}

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
				<HelmetProvider>
					<RouterProvider router={router} />
				</HelmetProvider>
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

import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

export const createApp = () => {
	return {
		routes: [
			{ path: "/", component: () => React.createElement("div", null, "Home") },
			{
				path: "/about",
				component: () => React.createElement("div", null, "About"),
			},
			{
				path: "/blog",
				component: () => React.createElement("div", null, "Blog"),
			},
			{
				path: "/blog/:slug",
				component: () => React.createElement("div", null, "Blog Post"),
			},
		],
		render: (element: HTMLElement) => {
			const root = ReactDOM.createRoot(element);
			root.render(
				React.createElement(
					StrictMode,
					null,
					React.createElement(
						HelmetProvider,
						null,
						React.createElement(ChakraProvider, {
							value: defaultSystem,
							children: React.createElement(RouterProvider, { router }),
						})
					)
				)
			);
			return root;
		},
	};
};

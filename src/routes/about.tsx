import { createFileRoute } from "@tanstack/react-router";
import { AboutPagePanda } from "../pages/AboutPagePanda";

type AboutData = {
	title: string;
	html: string;
};

export const Route = createFileRoute("/about")({
	component: AboutPage,
	loader: async (): Promise<{ aboutData: AboutData }> => {
		try {
			const response = await fetch("/data/pages/about.json");
			if (!response.ok) {
				throw new Error(`Failed to load about data: ${response.status}`);
			}
			const aboutData = await response.json();
			return { aboutData };
		} catch (error) {
			console.error("Failed to load about data:", error);
			// Fallback data
			return {
				aboutData: {
					title: "About",
					html: "",
				},
			};
		}
	},
});

function AboutPage() {
	const { aboutData } = Route.useLoaderData();
	return <AboutPagePanda aboutData={aboutData} />;
}

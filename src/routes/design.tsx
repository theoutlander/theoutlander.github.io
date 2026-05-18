import { createFileRoute } from "@tanstack/react-router";
import { BrandingPagePanda } from "../pages/BrandingPagePanda";

export const Route = createFileRoute("/design")({
	component: BrandingPage,
});

function BrandingPage() {
	return <BrandingPagePanda />;
}

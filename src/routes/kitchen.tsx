import { createFileRoute } from "@tanstack/react-router";
import { KitchenPagePanda } from "../pages/KitchenPagePanda";

export const Route = createFileRoute("/kitchen")({
	component: KitchenPage,
});

function KitchenPage() {
	return <KitchenPagePanda />;
}

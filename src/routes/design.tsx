import { createFileRoute } from "@tanstack/react-router";
import { DesignSystemPage } from "../pages/DesignSystemPage";

export const Route = createFileRoute("/design")({
	component: DesignSystemPage,
});

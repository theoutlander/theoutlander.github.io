import { createFileRoute } from "@tanstack/react-router";
import { CalendarPagePanda } from "../pages/CalendarPagePanda";

export const Route = createFileRoute("/calendar")({
    component: () => <CalendarPagePanda />,
});



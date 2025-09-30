import { createFileRoute } from "@tanstack/react-router";
import { css } from "../../styled-system/css";
import AboutPage from "../components/About";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";

export const Route = createFileRoute("/about")({
	component: function About() {
		return (
			<div className={css({ bg: "gray.50", minH: "100vh" })}>
				<HeaderSSR currentPage="about" />
				<AboutPage />
				<Footer />
			</div>
		);
	},
});

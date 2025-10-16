import { css } from "../../styled-system/css/index.mjs";
import { Helmet } from "react-helmet-async";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import Resume from "../components/Resume";
import ResumePrintStyles from "../components/ResumePrintStyles";
import SkipLink from "../components/SkipLink";

export function ResumePagePanda() {
	return (
		<>
			<Helmet>
				<title>Nick Karnik Resume | Engineering Leadership & Expertise</title>
				<meta
					name="description"
					content="Browse the resume of Nick Karnik: engineering leadership, staff software engineering, and delivery at scale."
				/>
				<link rel="canonical" href="https://nick.karnik.io/resume" />
			</Helmet>
			<ResumePrintStyles />
			<div
				className={css({
					bg: "gray.50",
					minH: "100vh",
					width: "100%",
					overflowX: "hidden",
				})}
			>
				<SkipLink />
				<HeaderSSR currentPage="resume" />
				<main id="main-content">
					<Resume />
				</main>
				<Footer />
			</div>
		</>
	);
}

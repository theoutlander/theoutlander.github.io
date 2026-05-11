import { css } from "../../styled-system/css/index.mjs";
import { Helmet } from "../components/seo/HelmetShim";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import Resume from "../components/Resume";
import ResumePrintStyles from "../components/ResumePrintStyles";
import SkipLink from "../components/SkipLink";

export function ResumePagePanda() {
	return (
		<>
			<Helmet>
				<title>Nick Karnik | Resume</title>
				<meta
					name="description"
					content="Software engineer and engineering leader with 25 years across Google, Microsoft, Tableau, and startups."
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

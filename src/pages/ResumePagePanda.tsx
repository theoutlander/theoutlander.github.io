import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import Resume from "../components/Resume";
import ResumePrintStyles from "../components/ResumePrintStyles";
import SkipLink from "../components/SkipLink";

export function ResumePagePanda() {
	return (
		<>
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

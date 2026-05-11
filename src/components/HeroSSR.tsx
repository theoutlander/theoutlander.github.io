import { css } from "../../styled-system/css/index.mjs";
import NameHeader from "./NameHeader";

export default function HeroSSR() {
	const bioFooter = (
		<p
			className={css({
				fontSize: { base: "md", sm: "lg", md: "xl" },
				fontWeight: "medium",
				lineHeight: { base: "1.65", md: "1.6" },
				letterSpacing: "normal",
				color: { base: "gray.900", _dark: "dark.text" },
				textAlign: { base: "center", md: "left" },
				mb: "0",
				mt: { base: "1", md: "0" },
				px: { base: "0", md: "0" },
				maxW: { base: "100%", md: "38rem" },
				mx: { base: "auto", md: "0" },
			})}
		>
			Twenty-five years of building software across search engines, disease models, data platforms, and
			AI tools. Serious about cooking, cocktails, travel, and building games with my three kids. Still
			figuring out what comes next and building it anyway.
		</p>
	);

	return (
		<section
			style={{ paddingTop: "0" }}
			className={css({
				bg: "white",
				_dark: { bg: "dark.surface" },
				pb: { base: "6", md: "8" },
				width: "100%",
			})}
		>
			<div
				className={css({
					width: "100%",
				})}
			>
				<NameHeader
					plain
					footer={bioFooter}
					showDownloadButton={false}
					showSubtitle={false}
					showTagPills={false}
					showSocialLinks={false}
				/>
			</div>
		</section>
	);
}

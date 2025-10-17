import { css } from "../../styled-system/css/index.mjs";
import { container } from "../../styled-system/patterns/index.mjs";

interface HeaderProps {
	currentPage?: "home" | "blogs" | "about" | "resume";
}

export default function HeaderSSR({ currentPage }: HeaderProps = {}) {
	const BRAND = "Nick Karnik";

	return (
		<header
			className={css({
				position: "sticky",
				top: 0,
				zIndex: 10,
				bg: { base: "white", _dark: "dark.surface" },
				borderBottom: "1px solid",
				borderColor: "gray.200",
				backdropFilter: { base: "none", md: "saturate(180%) blur(8px)" },
				WebkitBackdropFilter: { base: "none", md: "saturate(180%) blur(8px)" },
			})}
		>
			<div className={container({ maxW: "6xl", py: 3 })}>
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 6,
					})}
				>
					<a
						href="/"
						aria-current={currentPage === "home" ? "page" : undefined}
						className={css({
							textDecoration: "none",
							_focus: {
								outline: "2px solid brand.600",
								outlineOffset: "2px",
								borderRadius: "4px",
							},
						})}
					>
						<h1
							className={css({
								fontSize: "md",
								fontWeight: "semibold",
								color: { base: "gray.900", _dark: "dark.text" },
								fontFamily: "heading",
								margin: 0,
							})}
						>
							{BRAND}
						</h1>
					</a>

					<nav
						className={css({
							display: "flex",
							alignItems: "center",
							gap: 6,
						})}
						aria-label="Main navigation"
					>
						<a
							href="/blog"
							aria-current={currentPage === "blogs" ? "page" : undefined}
							className={css({
								color: currentPage === "blogs" ? "brand.600" : "gray.600",
								fontWeight: currentPage === "blogs" ? "medium" : "normal",
								textDecoration: "none",
								padding: "8px 12px",
								borderRadius: "4px",
								minHeight: "44px",
								display: "flex",
								alignItems: "center",
								_hover: {
									color: "brand.600",
									textDecoration: "underline",
								},
								_focus: {
									outline: "2px solid brand.600",
									outlineOffset: "2px",
								},
							})}
						>
							Blog
						</a>
						<a
							href="/about"
							aria-current={currentPage === "about" ? "page" : undefined}
							className={css({
								color: currentPage === "about" ? "brand.600" : "gray.600",
								fontWeight: currentPage === "about" ? "medium" : "normal",
								textDecoration: "none",
								padding: "8px 12px",
								borderRadius: "4px",
								minHeight: "44px",
								display: "flex",
								alignItems: "center",
								_hover: {
									color: "brand.600",
									textDecoration: "underline",
								},
								_focus: {
									outline: "2px solid brand.600",
									outlineOffset: "2px",
								},
							})}
						>
							About
						</a>
						<a
							href="/resume"
							aria-current={currentPage === "resume" ? "page" : undefined}
							className={css({
								color: currentPage === "resume" ? "brand.600" : "gray.600",
								fontWeight: currentPage === "resume" ? "medium" : "normal",
								textDecoration: "none",
								padding: "8px 12px",
								borderRadius: "4px",
								minHeight: "44px",
								display: "flex",
								alignItems: "center",
								_hover: {
									color: "brand.600",
									textDecoration: "underline",
								},
								_focus: {
									outline: "2px solid brand.600",
									outlineOffset: "2px",
								},
							})}
						>
							Resume
						</a>
						<a
							href="/schedule"
							className={css({
								color: "gray.600",
								fontWeight: "normal",
								textDecoration: "none",
								padding: "8px 12px",
								borderRadius: "4px",
								minHeight: "44px",
								display: "flex",
								alignItems: "center",
								_hover: {
									color: "brand.600",
									textDecoration: "underline",
								},
								_focus: {
									outline: "2px solid brand.600",
									outlineOffset: "2px",
								},
							})}
						>
							Schedule
						</a>
					</nav>
				</div>
			</div>
		</header>
	);
}

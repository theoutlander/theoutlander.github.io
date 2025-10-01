import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "./HeaderSSR";
import Footer from "./Footer";
import SkipLink from "./SkipLink";

export default function NotFound() {
	return (
		<div
			className={css({
				bg: { base: "gray.50", _dark: "dark.bg" },
				minH: "100vh",
				display: "flex",
				flexDirection: "column",
			})}
		>
			<SkipLink />
			<HeaderSSR currentPage="home" />
			<main
				id="main-content"
				className={css({
					flex: "1",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					py: { base: "12", md: "16" },
					px: "4",
				})}
			>
				<div
					className={css({
						textAlign: "center",
						maxW: "md",
					})}
				>
					{/* 404 Icon */}
					<div
						className={css({
							fontSize: "8xl",
							mb: "6",
							opacity: "0.8",
						})}
					>
						🔍
					</div>

					{/* 404 Title */}
					<h1
						className={css({
							fontSize: { base: "4xl", md: "6xl" },
							fontWeight: "bold",
							color: { base: "gray.900", _dark: "dark.text" },
							mb: "4",
							lineHeight: "1.1",
						})}
					>
						404
					</h1>

					{/* Error Message */}
					<h2
						className={css({
							fontSize: { base: "xl", md: "2xl" },
							fontWeight: "semibold",
							color: { base: "gray.700", _dark: "dark.textSecondary" },
							mb: "4",
						})}
					>
						Page Not Found
					</h2>

					<p
						className={css({
							fontSize: "lg",
							color: { base: "gray.600", _dark: "dark.textMuted" },
							mb: "8",
							lineHeight: "1.6",
						})}
					>
						Sorry, we couldn't find the page you're looking for. It might have
						been moved, deleted, or doesn't exist.
					</p>

					{/* Action Buttons */}
					<div
						className={css({
							display: "flex",
							flexDirection: { base: "column", sm: "row" },
							gap: "4",
							justifyContent: "center",
							alignItems: "center",
						})}
					>
						<a
							href="/"
							className={css({
								display: "inline-flex",
								alignItems: "center",
								gap: "2",
								px: "6",
								py: "3",
								bg: "brand.600",
								color: "white",
								textDecoration: "none",
								borderRadius: "md",
								fontWeight: "medium",
								fontSize: "lg",
								_hover: {
									bg: "brand.700",
									transform: "translateY(-1px)",
								},
								_focus: {
									outline: "2px solid brand.600",
									outlineOffset: "2px",
								},
								transition: "all 200ms ease",
								"@media (prefers-reduced-motion: reduce)": {
									transition: "none",
									_hover: {
										transform: "none",
									},
								},
							})}
						>
							<span>←</span>
							<span>Go Home</span>
						</a>

						<a
							href="/blog"
							className={css({
								display: "inline-flex",
								alignItems: "center",
								gap: "2",
								px: "6",
								py: "3",
								bg: { base: "white", _dark: "dark.card" },
								color: { base: "gray.700", _dark: "dark.text" },
								textDecoration: "none",
								borderRadius: "md",
								fontWeight: "medium",
								fontSize: "lg",
								border: "1px solid",
								borderColor: { base: "gray.200", _dark: "dark.border" },
								_hover: {
									bg: { base: "gray.50", _dark: "dark.surface" },
									transform: "translateY(-1px)",
								},
								_focus: {
									outline: "2px solid brand.600",
									outlineOffset: "2px",
								},
								transition: "all 200ms ease",
								"@media (prefers-reduced-motion: reduce)": {
									transition: "none",
									_hover: {
										transform: "none",
									},
								},
							})}
						>
							<span>📝</span>
							<span>Read Blog</span>
						</a>
					</div>

					{/* Help Text */}
					<p
						className={css({
							fontSize: "sm",
							color: { base: "gray.500", _dark: "dark.textMuted" },
							mt: "8",
						})}
					>
						Need help?{" "}
						<a
							href="mailto:nick@karnik.io"
							className={css({
								color: "brand.600",
								textDecoration: "none",
								_hover: {
									textDecoration: "underline",
								},
							})}
						>
							Contact me
						</a>
					</p>
				</div>
			</main>
			<Footer />
		</div>
	);
}

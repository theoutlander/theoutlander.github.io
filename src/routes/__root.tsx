import React from "react";
import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { Box, Container, Flex, HStack, Heading } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import Footer from "../components/layout/Footer";
import NavLink from "../components/nav/NavLink";

function Header() {
	const BRAND = "Nick Karnik";

	return (
		<Box
			as="header"
			position="sticky"
			top={0}
			zIndex={10}
			bg="white"
			borderBottom="1px solid"
			borderColor="gray.200"
			backdropFilter="saturate(180%) blur(8px)"
		>
			<Container
				maxW="6xl"
				py={3}
			>
				<Flex
					align="center"
					justify="space-between"
					gap={6}
				>
					<Link
						to="/"
						preload="intent"
					>
						<Heading
							size="md"
							color="gray.800"
						>
							{BRAND}
						</Heading>
					</Link>

					<HStack gap={6}>
						<NavLink to="/blog">Blog</NavLink>
						<NavLink to="/about">About</NavLink>
						<NavLink to="/resume">Resume</NavLink>
						<NavLink to="/landing-hybrid">Landing</NavLink>
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
}

export const Route = createRootRoute({
	component: () => {
		return (
			<>
				<Helmet>
					<title>Nick Karnik - Software Engineer & Tech Leader</title>
					<meta
						name="description"
						content="Software engineer and tech leader sharing insights on engineering, AI, and technology. Read my blog for the latest thoughts and experiences."
					/>
					<meta
						property="og:title"
						content="Nick Karnik - Software Engineer & Tech Leader"
					/>
					<meta
						property="og:description"
						content="Software engineer and tech leader sharing insights on engineering, AI, and technology. Read my blog for the latest thoughts and experiences."
					/>
					<meta
						property="og:type"
						content="website"
					/>
					<meta
						property="og:url"
						content="https://nick.karnik.io"
					/>
					<meta
						name="twitter:card"
						content="summary"
					/>
					<meta
						name="twitter:title"
						content="Nick Karnik - Software Engineer & Tech Leader"
					/>
					<meta
						name="twitter:description"
						content="Software engineer and tech leader sharing insights on engineering, AI, and technology. Read my blog for the latest thoughts and experiences."
					/>
				</Helmet>
				<Box
					bg="gray.50"
					minH="100vh"
				>
					<Header />
					<Container
						as="main"
						maxW="6xl"
						py={{ base: 6, md: 10 }}
					>
						<Outlet />
					</Container>
					<Footer />
				</Box>
			</>
		);
	},
});

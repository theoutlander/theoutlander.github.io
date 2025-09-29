import React from "react";
import {
	Outlet,
	createRootRoute,
	Link,
	useRouterState,
} from "@tanstack/react-router";
import {
	Box,
	Container,
	Flex,
	HStack,
	Heading,
	Link as CLink,
} from "@chakra-ui/react";
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
					<CLink
						as={Link}
						to="/"
						preload="intent"
						_hover={{ textDecoration: "none" }}
					>
						<Heading
							size="md"
							color="gray.800"
						>
							{BRAND}
						</Heading>
					</CLink>

					<HStack gap={6}>
						<NavLink to="/blog">Blog</NavLink>
						<NavLink to="/about">About</NavLink>
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
}

export const Route = createRootRoute({
	component: () => {
		return (
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
		);
	},
});

import {
	Box,
	Container,
	Flex,
	HStack,
	Link as CLink,
	Button,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

export default function Header() {
	return (
		<Box
			as="header"
			borderBottom="1px solid"
			borderColor="gray.200"
			bg="white"
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
					{/* Brand: pick one label and keep it consistent */}
					<Link
						to="/"
						preload="intent"
					>
						<Button
							variant="ghost"
							size="sm"
							fontWeight="bold"
							px={3}
							rounded="lg"
						>
							Nick Karnik
						</Button>
					</Link>

					<HStack gap={4}>
						<Link
							to="/"
							preload="intent"
						>
							<CLink>Home</CLink>
						</Link>
						<Link
							to="/blog"
							preload="intent"
						>
							<CLink>Blog</CLink>
						</Link>
						<Link
							to="/about"
							preload="intent"
						>
							<CLink>About</CLink>
						</Link>
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
}

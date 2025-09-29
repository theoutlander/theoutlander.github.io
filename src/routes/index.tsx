import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Box, SimpleGrid, Card, Skeleton } from "@chakra-ui/react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
	component: function Index() {
		const navigate = useNavigate();

		useEffect(() => {
			navigate({ to: "/blog" });
		}, [navigate]);

		return (
			<Box>
				<Skeleton
					height="32px"
					mb={6}
					width="120px"
				/>
				<SimpleGrid
					columns={{ base: 1, md: 2 }}
					gap={6}
				>
					{Array.from({ length: 4 }).map((_, i) => (
						<Card.Root
							key={i}
							borderRadius="2xl"
							overflow="hidden"
						>
							<Skeleton height="220px" />
							<Box p={4}>
								<Skeleton
									height="20px"
									mb={2}
								/>
								<Skeleton
									height="14px"
									width="40%"
								/>
								<Skeleton
									height="48px"
									mt={4}
								/>
							</Box>
						</Card.Root>
					))}
				</SimpleGrid>
			</Box>
		);
	},
});

import * as React from "react";
import { Text } from "@chakra-ui/react";
import { Link, useRouterState } from "@tanstack/react-router";

export default function NavLink({
	to,
	children,
}: {
	to: string;
	children: React.ReactNode;
}) {
	const { pathname } = useRouterState().location;
	const active = pathname === to || pathname.startsWith(to + "/");
	return (
		<Link
			to={to}
			preload="intent"
		>
			<Text
				color={active ? "blue.700" : "gray.600"}
				fontWeight={active ? "semibold" : "normal"}
				_hover={{ color: "blue.700" }}
			>
				{children}
			</Text>
		</Link>
	);
}

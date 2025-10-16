import React from "react";

type HelmetProps = { children?: React.ReactNode };

export function Helmet({ children }: HelmetProps) {
	// No-op on SSR: SEO/meta are handled in src/ssr-renderer.tsx
	return <>{children}</>;
}

export function HelmetProvider({ children }: { children?: React.ReactNode }) {
	return <>{children}</>;
}



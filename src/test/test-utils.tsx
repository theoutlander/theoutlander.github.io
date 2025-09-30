import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Custom render function that wraps components with any providers if needed
const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">
) => {
	return rtlRender(ui, {
		// Add any global providers here if needed in the future
		...options,
	});
};

// Re-export everything from testing library
export * from "@testing-library/react";
export { customRender as render };

import React from "react";

interface ConceptBoxProps {
	children: React.ReactNode;
	caption?: string;
}

/**
 * ConceptBox: Displays key concepts, formulas, and definitions with consistent styling.
 *
 * Usage in React:
 *   <ConceptBox caption="Range: 0–1 | Good: 0.8–0.9">
 *     <strong>F1 Score = 2 × (Precision × Recall) / (Precision + Recall)</strong>
 *   </ConceptBox>
 *
 * Usage in Markdown (uses same .concept-box CSS class):
 *   <div class="concept-box">
 *   **F1 Score = 2 × (Precision × Recall) / (Precision + Recall)**
 *   <small>Range: 0–1 | Good: 0.8–0.9</small>
 *   </div>
 *
 * Styling lives in: src/styles/blog-components.css
 * Change the style once, it updates everywhere — both React components and markdown content.
 */
export function ConceptBox({ children, caption }: ConceptBoxProps) {
	return (
		<div className="concept-box">
			{children}
			{caption && <small>{caption}</small>}
		</div>
	);
}

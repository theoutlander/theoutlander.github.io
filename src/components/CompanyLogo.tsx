import { companyLogo } from "../../styled-system/recipes/index.mjs";
import { css } from "../../styled-system/css";

// Company logo component
export function CompanyLogo({
	company,
	width = "120px",
}: {
	company: string;
	width?: string;
}) {
	const logos: Record<string, React.ReactElement> = {
		google: (
			<img
				src="/assets/images/companies/google.svg"
				alt="Google"
				className={css(companyLogo(), { width: width })}
			/>
		),
		microsoft: (
			<img
				src="/assets/images/companies/microsoft.png"
				alt="Microsoft"
				className={css(companyLogo(), { width: width })}
			/>
		),
		salesforce: (
			<img
				src="/assets/images/companies/salesforce.svg"
				alt="Salesforce"
				className={css(companyLogo(), { width: width })}
			/>
		),
		ycombinator: (
			<img
				src="/assets/images/companies/ycombinator.svg"
				alt="Y Combinator"
				className={css(companyLogo(), { width: width })}
			/>
		),
		umd: (
			<img
				// src='/assets/images/companies/umd.svg'
				src="https://eng.umd.edu/sites/clark.umd.edu/themes/clark/assets/images/logo.svg"
				alt="University of Maryland"
				className={css(companyLogo(), { width: width })}
				width="200px"
			/>
		),
		idm: (
			<img
				src="/assets/images/companies/idm.jpg"
				alt="Gates Foundation"
				className={css(companyLogo(), { width: width })}
			/>
		),
		tmobile: (
			<img
				src="/assets/images/companies/tmobile.jpeg"
				alt="T-Mobile"
				className={css(companyLogo(), { width: width })}
			/>
		),
		tableau: (
			<img
				src="/assets/images/companies/tableau.svg"
				alt="Tableau"
				className={css(companyLogo(), { width: width })}
			/>
		),
		jobbatical: (
			<img
				src="/assets/images/companies/jobbatical.png"
				alt="Jobbatical"
				className={css(companyLogo(), { width: width })}
			/>
		),
		treasure: (
			<img
				src="/assets/images/companies/treasure.webp"
				alt="Treasure Technologies"
				className={css(companyLogo(), { width: width })}
			/>
		),
		"compass-technologies": (
			<img
				src="/assets/images/companies/compass-technologies.png"
				alt="Compass Technologies"
				className={css(companyLogo(), { width: width })}
			/>
		),
		fullstack: (
			<img
				src="/assets/images/companies/fullstack-consulting.jpeg"
				alt="Fullstack Consulting"
				className={css(companyLogo(), { width: width })}
			/>
		),
		"bluehippo-funding": (
			<img
				src="/assets/images/companies/bluehippo-funding.png"
				alt="Blue Hippo Funding"
				className={css(companyLogo(), { width: width })}
			/>
		),
		"meds-publishing": (
			<img
				src="/assets/images/companies/meds-publishing.png"
				alt="Meds Publishing"
				className={css(companyLogo(), { width: width })}
			/>
		),
		theglobalist: (
			<img
				src="/assets/images/companies/theglobalist.jpg"
				alt="The Globalist"
				className={css(companyLogo(), { width: width })}
			/>
		),
		"gemini-code-assist": (
			<img
				src="/assets/images/companies/gemini-code-assist.png"
				alt="Gemini"
				className={css(companyLogo(), { width: width })}
			/>
		),
		roomtoday: (
			<img
				src="/assets/images/companies/room-today.png"
				alt="RoomToday"
				className={css(companyLogo(), { width: width })}
			/>
		),
		"wdc-3": (
			<img
				src="/assets/images/companies/wdc-3.png"
				alt="WDC-3"
				className={css(companyLogo(), { width: width })}
			/>
		),
		plutonic: (
			<div
				className={css(companyLogo(), {
					width: "120px",
					height: "120px",
					backgroundColor: "#6366f1",
					borderRadius: "12px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "white",
					fontSize: "18px",
					fontWeight: "bold",
					fontFamily: "system-ui, sans-serif",
				})}
			>
				Plutonic
			</div>
		),
		"videoly platform": (
			<div
				className={css(companyLogo(), {
					width: "120px",
					height: "120px",
					backgroundColor: "#ff6b6b",
					borderRadius: "12px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "white",
					fontSize: "16px",
					fontWeight: "bold",
					fontFamily: "system-ui, sans-serif",
				})}
			>
				Videoly
			</div>
		),
		"roomtoday platform": (
			<img
				src="/assets/images/companies/room-today.png"
				alt="RoomToday Platform"
				className={css(companyLogo(), { width: width })}
			/>
		),
	};

	const logo = logos[company.toLowerCase()];
	if (!logo) return null;

	return logo;
}

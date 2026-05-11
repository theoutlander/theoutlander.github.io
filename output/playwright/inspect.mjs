import { chromium } from "/Users/nickkarnik/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const ctx = await browser.newContext({
	viewport: { width: 1280, height: 900 },
	ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
await page.goto("https://localhost:5174/", { waitUntil: "networkidle" });

const data = await page.evaluate(() => {
	const main = document.getElementById("main-content");
	if (!main) return { error: "no main" };
	const section = main.querySelector("section");
	const sectionRect = section?.getBoundingClientRect();
	const sectionCS = section ? getComputedStyle(section) : null;

	const header = document.querySelector("header");
	const headerRect = header?.getBoundingClientRect();

	const avatar = section?.querySelector("img");
	const avatarRect = avatar?.getBoundingClientRect();

	const innerDiv = section?.querySelector(":scope > div");
	const innerDivRect = innerDiv?.getBoundingClientRect();
	const innerDivCS = innerDiv ? getComputedStyle(innerDiv) : null;

	return {
		header: {
			rect: headerRect ? { top: headerRect.top, bottom: headerRect.bottom, height: headerRect.height } : null,
		},
		section: {
			class: section?.className,
			rect: sectionRect ? { top: sectionRect.top, bottom: sectionRect.bottom, height: sectionRect.height } : null,
			paddingTop: sectionCS?.paddingTop,
			paddingBottom: sectionCS?.paddingBottom,
			marginTop: sectionCS?.marginTop,
			display: sectionCS?.display,
			alignItems: sectionCS?.alignItems,
		},
		innerDiv: {
			class: innerDiv?.className,
			rect: innerDivRect ? { top: innerDivRect.top, height: innerDivRect.height } : null,
			marginTop: innerDivCS?.marginTop,
			paddingTop: innerDivCS?.paddingTop,
		},
		avatar: {
			rect: avatarRect ? { top: avatarRect.top, height: avatarRect.height } : null,
		},
	};
});
console.log(JSON.stringify(data, null, 2));
await browser.close();

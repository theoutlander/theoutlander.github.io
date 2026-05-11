import React from "react";
import NameHeader from "./NameHeader";

/** Shared profile block (avatar, links, resume) for About. */
export default function ProfileIntroHeader() {
	return (
		<NameHeader
			showDownloadButton={true}
			showSubtitle={false}
			showTagPills={false}
		/>
	);
}

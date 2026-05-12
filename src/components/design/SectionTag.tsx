import React from "react";

interface SectionTagProps {
  num: string;
  label: string;
  right?: React.ReactNode;
}

export const SectionTag = ({ num, label, right }: SectionTagProps) => (
  <div className="ds-section-tag">
    <span className="ds-num">{num}</span>
    <span className="ds-label">{label}</span>
    {right ? <span className="ds-right">{right}</span> : null}
  </div>
);

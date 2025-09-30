import { css } from '../../styled-system/css/index.mjs';

export default function ResumePrintStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@media print {
  @page { size: A4; margin: 14mm; }
  header, nav, footer { display: none !important; }
  a[href]:after { content: none !important; }
  .resume-card { 
    box-shadow: none !important; 
    border-color: var(--colors-gray-300) !important; 
  }
  .no-print { display: none !important; }
}
`,
      }}
    />
  );
}

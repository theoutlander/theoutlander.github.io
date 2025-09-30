import { css } from '../../styled-system/css/index.mjs';
import HeaderSSR from '../components/HeaderSSR';
import Footer from '../components/Footer';
import Resume from '../components/Resume';
import ResumePrintStyles from '../components/ResumePrintStyles';

export function ResumePagePanda() {
  return (
    <>
      <ResumePrintStyles />
      <div
        className={css({
          bg: 'gray.50',
          minH: '100vh',
        })}
      >
        <HeaderSSR currentPage='resume' />
        <Resume />
        <Footer />
      </div>
    </>
  );
}

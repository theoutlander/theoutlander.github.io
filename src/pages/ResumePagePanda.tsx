import { css } from '../../styled-system/css/index.mjs';
import Header from '../components/Header';
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
        <Header currentPage='resume' />
        <Resume />
        <Footer />
      </div>
    </>
  );
}

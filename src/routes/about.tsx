import { createFileRoute } from '@tanstack/react-router';
import { css } from '../../styled-system/css';
import AboutPage from '../components/About';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const Route = createFileRoute('/about')({
  component: function About() {
    return (
      <div className={css({ bg: 'gray.50', minH: '100vh' })}>
        <Header currentPage='about' />
        <AboutPage />
        <Footer />
      </div>
    );
  },
});

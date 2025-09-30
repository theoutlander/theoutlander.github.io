import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import HeaderSSR from '../components/HeaderSSR';
import Footer from '../components/Footer';
import HeroSSR from '../components/HeroSSR';
import CoreCompetencies from '../components/CoreCompetencies';
import StatsStrip from '../components/StatsStrip';

interface HomePageProps {
  posts: any[];
}

export function HomePagePanda({ posts }: HomePageProps) {
  return (
    <div
      className={css({
        bg: 'gray.50',
        minHeight: '100vh',
      })}
    >
      <HeaderSSR currentPage='home' />
      <main>
        <HeroSSR />
        <CoreCompetencies />
        <StatsStrip />
      </main>
      <Footer />
    </div>
  );
}

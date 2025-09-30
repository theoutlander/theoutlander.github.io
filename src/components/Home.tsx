import Hero from './Hero';
import CoreCompetencies from './CoreCompetencies';
import StatsStrip from './StatsStrip';
import Footer from './Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <CoreCompetencies />
      {/* If you want a Now or LatestPosts section, insert here; keep it short (2–3 posts). */}
      <StatsStrip />
      <Footer />
    </>
  );
}

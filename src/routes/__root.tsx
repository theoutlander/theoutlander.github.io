import '../styles/print.css';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SiteNav } from '../components/design/SiteNav';
import { SiteFooter } from '../components/design/SiteFooter';
import { NotFoundView } from '../components/design/NotFoundView';

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="ds-site-nav-bar">
        <SiteNav />
      </header>
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  ),
  notFoundComponent: NotFoundView,
});

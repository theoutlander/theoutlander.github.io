import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SiteNav } from '../components/design/SiteNav';
import { SiteFooter } from '../components/design/SiteFooter';

export const Route = createRootRoute({
  component: () => (
    <>
      <SiteNav />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  ),
});

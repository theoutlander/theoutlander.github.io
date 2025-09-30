import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$')({
  beforeLoad: () => {
    // Redirect to the lost page for any unmatched routes
    throw redirect({ to: '/lost' });
  },
  component: function CatchAll() {
    // This component will never render due to the redirect above
    return null;
  },
});

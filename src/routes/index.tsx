import { createFileRoute } from '@tanstack/react-router';
import { HomePagePanda } from '../pages/HomePagePanda';

export const Route = createFileRoute('/')({
  component: () => <HomePagePanda posts={[]} />,
});

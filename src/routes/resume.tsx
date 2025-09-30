import { createFileRoute } from '@tanstack/react-router';
import { ResumePagePanda } from '../pages/ResumePagePanda';

export const Route = createFileRoute('/resume')({
  component: () => <ResumePagePanda />,
});

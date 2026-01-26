export interface CodementorReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  authorImage?: string;
  authorImageLocal?: string;
}

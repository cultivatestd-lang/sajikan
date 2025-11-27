export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image: string; // Can be Unsplash query or direct URL
  category: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  time: string;
  rating: number;
  source?: 'curated' | 'dapurumami';
  score?: number;
}



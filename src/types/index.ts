export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Dataset {
  id: string;
  user_id: string;
  name: string;
  data: CustomerRecord[];
  created_at: string;
}

export interface CustomerRecord {
  [key: string]: string | number;
}

export interface ClusterResult {
  id: string;
  user_id: string;
  dataset_id: string;
  name: string;
  k: number;
  features: string[];
  clusters: ClusterData[];
  metrics: ClusterMetrics;
  created_at: string;
}

export interface ClusterData {
  id: number;
  centroid: number[];
  customers: CustomerRecord[];
  size: number;
  characteristics: { [key: string]: number };
}

export interface ClusterMetrics {
  silhouetteScore: number;
  inertia: number;
  optimalK: number;
  rfmScores?: {
    recency: number;
    frequency: number;
    monetary: number;
  };
}

export interface RFMAnalysis {
  customerId: string;
  recency: number;
  frequency: number;
  monetary: number;
  rfmScore: string;
  segment: string;
}

export interface MarketRecommendation {
  segment: string;
  description: string;
  strategy: string;
  tactics: string[];
  priority: 'High' | 'Medium' | 'Low';
}

export interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}
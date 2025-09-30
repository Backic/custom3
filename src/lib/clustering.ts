import type { CustomerRecord, ClusterData, ClusterMetrics } from '../types';

export class KMeansClusterer {
  private data: number[][];
  private k: number;
  private maxIterations: number;
  private tolerance: number;

  constructor(data: number[][], k: number, maxIterations = 100, tolerance = 1e-4) {
    this.data = data;
    this.k = k;
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
  }

  private euclideanDistance(point1: number[], point2: number[]): number {
    return Math.sqrt(
      point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
    );
  }

  private initializeCentroids(): number[][] {
    const centroids: number[][] = [];
    const numFeatures = this.data[0].length;
    
    for (let i = 0; i < this.k; i++) {
      const centroid = [];
      for (let j = 0; j < numFeatures; j++) {
        const min = Math.min(...this.data.map(point => point[j]));
        const max = Math.max(...this.data.map(point => point[j]));
        centroid.push(Math.random() * (max - min) + min);
      }
      centroids.push(centroid);
    }
    
    return centroids;
  }

  private assignPointsToClusters(centroids: number[][]): number[] {
    return this.data.map(point => {
      let minDistance = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, i) => {
        const distance = this.euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = i;
        }
      });
      
      return clusterIndex;
    });
  }

  private updateCentroids(assignments: number[]): number[][] {
    const newCentroids: number[][] = [];
    const numFeatures = this.data[0].length;
    
    for (let k = 0; k < this.k; k++) {
      const clusterPoints = this.data.filter((_, i) => assignments[i] === k);
      
      if (clusterPoints.length === 0) {
        // If no points assigned to this cluster, keep the old centroid
        newCentroids.push(Array(numFeatures).fill(0));
        continue;
      }
      
      const centroid = Array(numFeatures).fill(0);
      clusterPoints.forEach(point => {
        point.forEach((val, j) => {
          centroid[j] += val;
        });
      });
      
      centroid.forEach((_, j) => {
        centroid[j] /= clusterPoints.length;
      });
      
      newCentroids.push(centroid);
    }
    
    return newCentroids;
  }

  private calculateInertia(centroids: number[][], assignments: number[]): number {
    return this.data.reduce((sum, point, i) => {
      const centroid = centroids[assignments[i]];
      return sum + Math.pow(this.euclideanDistance(point, centroid), 2);
    }, 0);
  }

  cluster(): { centroids: number[][], assignments: number[], inertia: number } {
    let centroids = this.initializeCentroids();
    let assignments: number[] = [];
    let prevInertia = Infinity;
    
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      assignments = this.assignPointsToClusters(centroids);
      const newCentroids = this.updateCentroids(assignments);
      const inertia = this.calculateInertia(newCentroids, assignments);
      
      if (Math.abs(prevInertia - inertia) < this.tolerance) {
        break;
      }
      
      centroids = newCentroids;
      prevInertia = inertia;
    }
    
    return { centroids, assignments, inertia: prevInertia };
  }
}

export function findOptimalK(data: number[][], maxK = 10): { optimalK: number, elbowData: Array<{k: number, inertia: number}> } {
  const elbowData = [];
  
  for (let k = 1; k <= Math.min(maxK, data.length - 1); k++) {
    const clusterer = new KMeansClusterer(data, k);
    const result = clusterer.cluster();
    elbowData.push({ k, inertia: result.inertia });
  }
  
  // Simple elbow method - find the point with maximum curvature
  let optimalK = 2;
  let maxCurvature = 0;
  
  for (let i = 1; i < elbowData.length - 1; i++) {
    const prev = elbowData[i - 1];
    const curr = elbowData[i];
    const next = elbowData[i + 1];
    
    const angle1 = Math.atan2(curr.inertia - prev.inertia, curr.k - prev.k);
    const angle2 = Math.atan2(next.inertia - curr.inertia, next.k - curr.k);
    const curvature = Math.abs(angle2 - angle1);
    
    if (curvature > maxCurvature) {
      maxCurvature = curvature;
      optimalK = curr.k;
    }
  }
  
  return { optimalK, elbowData };
}

export function performClustering(
  records: CustomerRecord[], 
  features: string[], 
  k?: number
): { clusters: ClusterData[], metrics: ClusterMetrics, elbowData: Array<{k: number, inertia: number}> } {
  // Extract numeric data for clustering
  const data = records.map(record => 
    features.map(feature => {
      const value = record[feature];
      return typeof value === 'number' ? value : parseFloat(value as string) || 0;
    })
  );

  // Normalize data (z-score normalization)
  const normalizedData = normalizeData(data);
  
  // Find optimal k if not provided
  const { optimalK, elbowData } = findOptimalK(normalizedData);
  const clusterCount = k || optimalK;
  
  // Perform clustering
  const clusterer = new KMeansClusterer(normalizedData, clusterCount);
  const { centroids, assignments, inertia } = clusterer.cluster();
  
  // Calculate silhouette score (simplified version)
  const silhouetteScore = calculateSilhouetteScore(normalizedData, assignments);
  
  // Group customers by cluster
  const clusters: ClusterData[] = [];
  for (let i = 0; i < clusterCount; i++) {
    const clusterCustomers = records.filter((_, index) => assignments[index] === i);
    const characteristics: { [key: string]: number } = {};
    
    // Calculate cluster characteristics (mean values)
    features.forEach(feature => {
      const values = clusterCustomers.map(customer => {
        const value = customer[feature];
        return typeof value === 'number' ? value : parseFloat(value as string) || 0;
      });
      characteristics[feature] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    clusters.push({
      id: i,
      centroid: centroids[i],
      customers: clusterCustomers,
      size: clusterCustomers.length,
      characteristics
    });
  }
  
  return {
    clusters,
    metrics: {
      silhouetteScore,
      inertia,
      optimalK
    },
    elbowData
  };
}

function normalizeData(data: number[][]): number[][] {
  if (data.length === 0) return data;
  
  const numFeatures = data[0].length;
  const means = Array(numFeatures).fill(0);
  const stds = Array(numFeatures).fill(0);
  
  // Calculate means
  data.forEach(row => {
    row.forEach((val, i) => {
      means[i] += val;
    });
  });
  means.forEach((_, i) => {
    means[i] /= data.length;
  });
  
  // Calculate standard deviations
  data.forEach(row => {
    row.forEach((val, i) => {
      stds[i] += Math.pow(val - means[i], 2);
    });
  });
  stds.forEach((_, i) => {
    stds[i] = Math.sqrt(stds[i] / data.length);
  });
  
  // Normalize
  return data.map(row => 
    row.map((val, i) => stds[i] === 0 ? 0 : (val - means[i]) / stds[i])
  );
}

function calculateSilhouetteScore(data: number[][], assignments: number[]): number {
  if (data.length <= 1) return 0;
  
  const scores = data.map((point, i) => {
    const ownCluster = assignments[i];
    const ownClusterPoints = data.filter((_, j) => assignments[j] === ownCluster && i !== j);
    
    if (ownClusterPoints.length === 0) return 0;
    
    // Calculate mean intra-cluster distance
    const a = ownClusterPoints.reduce((sum, otherPoint) => 
      sum + euclideanDistance(point, otherPoint), 0) / ownClusterPoints.length;
    
    // Calculate mean nearest-cluster distance
    const otherClusters = [...new Set(assignments)].filter(cluster => cluster !== ownCluster);
    if (otherClusters.length === 0) return 0;
    
    const b = Math.min(...otherClusters.map(cluster => {
      const clusterPoints = data.filter((_, j) => assignments[j] === cluster);
      return clusterPoints.reduce((sum, otherPoint) => 
        sum + euclideanDistance(point, otherPoint), 0) / clusterPoints.length;
    }));
    
    return (b - a) / Math.max(a, b);
  });
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function euclideanDistance(point1: number[], point2: number[]): number {
  return Math.sqrt(
    point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
  );
}
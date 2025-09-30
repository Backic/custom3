import type { CustomerRecord, RFMAnalysis, MarketRecommendation } from '../types';

export function calculateRFM(
  data: CustomerRecord[],
  recencyField: string,
  frequencyField: string,
  monetaryField: string,
  customerIdField: string = 'Customer_ID'
): RFMAnalysis[] {
  // Calculate RFM scores for each customer
  const rfmData = data.map(customer => {
    const recency = Number(customer[recencyField]) || 0;
    const frequency = Number(customer[frequencyField]) || 0;
    const monetary = Number(customer[monetaryField]) || 0;
    
    return {
      customerId: String(customer[customerIdField]),
      recency,
      frequency,
      monetary,
      rfmScore: '',
      segment: ''
    };
  });

  // Calculate quintiles for each metric
  const recencyValues = rfmData.map(d => d.recency).sort((a, b) => a - b);
  const frequencyValues = rfmData.map(d => d.frequency).sort((a, b) => b - a);
  const monetaryValues = rfmData.map(d => d.monetary).sort((a, b) => b - a);

  const getQuintile = (value: number, values: number[], reverse = false) => {
    const len = values.length;
    const quintileSize = len / 5;
    
    for (let i = 1; i <= 5; i++) {
      const threshold = values[Math.floor(quintileSize * i) - 1];
      if (reverse ? value >= threshold : value <= threshold) {
        return reverse ? 6 - i : i;
      }
    }
    return reverse ? 1 : 5;
  };

  // Assign RFM scores and segments
  return rfmData.map(customer => {
    const rScore = getQuintile(customer.recency, recencyValues, true); // Higher recency = better
    const fScore = getQuintile(customer.frequency, frequencyValues);
    const mScore = getQuintile(customer.monetary, monetaryValues);
    
    const rfmScore = `${rScore}${fScore}${mScore}`;
    const segment = getRFMSegment(rScore, fScore, mScore);
    
    return {
      ...customer,
      rfmScore,
      segment
    };
  });
}

function getRFMSegment(r: number, f: number, m: number): string {
  const total = r + f + m;
  
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
  if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers';
  if (r >= 4 && f <= 2) return 'New Customers';
  if (r >= 3 && f >= 3 && m <= 2) return 'Potential Loyalists';
  if (r >= 3 && f <= 2 && m <= 2) return 'Promising';
  if (r <= 2 && f >= 3 && m >= 3) return 'Need Attention';
  if (r <= 2 && f >= 2 && m >= 2) return 'About to Sleep';
  if (r <= 2 && f <= 2 && m >= 3) return 'At Risk';
  if (r <= 1 && f >= 2) return 'Cannot Lose Them';
  if (r <= 2 && f <= 2 && m <= 2) return 'Hibernating';
  
  return 'Others';
}

export function getMarketRecommendations(): MarketRecommendation[] {
  return [
    {
      segment: 'Champions',
      description: 'Your best customers who buy frequently and recently',
      strategy: 'Reward and retain these valuable customers',
      tactics: [
        'Offer exclusive products and early access',
        'Implement VIP loyalty programs',
        'Ask for referrals and reviews',
        'Upsell premium products'
      ],
      priority: 'High'
    },
    {
      segment: 'Loyal Customers',
      description: 'Consistent customers with good purchase history',
      strategy: 'Maintain engagement and increase purchase frequency',
      tactics: [
        'Recommend complementary products',
        'Offer loyalty rewards',
        'Send personalized offers',
        'Create subscription programs'
      ],
      priority: 'High'
    },
    {
      segment: 'New Customers',
      description: 'Recent customers with potential for growth',
      strategy: 'Nurture and convert to loyal customers',
      tactics: [
        'Send welcome series emails',
        'Offer onboarding discounts',
        'Provide excellent customer service',
        'Collect feedback and preferences'
      ],
      priority: 'Medium'
    },
    {
      segment: 'Potential Loyalists',
      description: 'Good recent customers who could buy more',
      strategy: 'Increase purchase frequency and value',
      tactics: [
        'Offer membership programs',
        'Send targeted promotions',
        'Recommend based on purchase history',
        'Create urgency with limited offers'
      ],
      priority: 'Medium'
    },
    {
      segment: 'At Risk',
      description: 'Customers who haven\'t purchased recently',
      strategy: 'Re-engage before they churn',
      tactics: [
        'Send win-back campaigns',
        'Offer significant discounts',
        'Survey for feedback',
        'Provide customer support'
      ],
      priority: 'High'
    },
    {
      segment: 'Cannot Lose Them',
      description: 'High-value customers at risk of churning',
      strategy: 'Immediate intervention required',
      tactics: [
        'Personal outreach from account managers',
        'Exclusive offers and incentives',
        'Address any service issues',
        'Provide premium support'
      ],
      priority: 'High'
    },
    {
      segment: 'Hibernating',
      description: 'Inactive customers with low engagement',
      strategy: 'Reactivate with compelling offers',
      tactics: [
        'Send reactivation campaigns',
        'Offer deep discounts',
        'Share new product updates',
        'Use different communication channels'
      ],
      priority: 'Low'
    }
  ];
}
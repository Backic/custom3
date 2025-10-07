# SegmentAI - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [System Requirements](#system-requirements)
3. [Hardware Requirements](#hardware-requirements)
4. [Software Requirements](#software-requirements)
5. [Architecture Overview](#architecture-overview)
6. [Technology Stack](#technology-stack)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Security Implementation](#security-implementation)
10. [Performance Considerations](#performance-considerations)
11. [Deployment Guide](#deployment-guide)
12. [Development Setup](#development-setup)
13. [Testing Strategy](#testing-strategy)
14. [Monitoring and Logging](#monitoring-and-logging)
15. [Troubleshooting](#troubleshooting)

## System Overview

SegmentAI is a web-based customer segmentation platform that leverages artificial intelligence and machine learning algorithms to analyze customer data and provide actionable business insights. The system supports two primary analysis methods:

- **K-Means Clustering**: Groups customers based on behavioral patterns and characteristics
- **RFM Analysis**: Segments customers by Recency, Frequency, and Monetary value

### Key Features
- CSV data upload and validation
- Interactive data preview with pagination
- Automated optimal cluster detection using elbow method
- Real-time clustering analysis with visualization
- RFM segmentation with marketing recommendations
- Analysis history and export capabilities
- Responsive design with dark/light theme support
- User authentication and profile management

## System Requirements

### Minimum System Requirements

#### Client-Side (User Browser)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: ES2020 support required
- **Memory**: 4GB RAM minimum
- **Storage**: 100MB available disk space
- **Network**: Broadband internet connection (1 Mbps minimum)
- **Screen Resolution**: 1024x768 minimum (responsive design)

#### Server-Side (Development/Hosting)
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Memory**: 2GB RAM minimum, 4GB recommended
- **Storage**: 1GB available disk space
- **Network**: Stable internet connection for package downloads

### Recommended System Requirements

#### Client-Side
- **Browser**: Latest versions of Chrome, Firefox, Safari, or Edge
- **Memory**: 8GB RAM or higher
- **Storage**: 500MB available disk space
- **Network**: High-speed broadband (10+ Mbps)
- **Screen Resolution**: 1920x1080 or higher

#### Server-Side
- **Memory**: 8GB RAM or higher
- **CPU**: Multi-core processor (4+ cores recommended)
- **Storage**: 10GB available disk space (SSD recommended)
- **Network**: High-speed internet connection

## Hardware Requirements

### Development Environment
- **CPU**: Intel i5/AMD Ryzen 5 or equivalent (minimum)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 256GB SSD minimum
- **GPU**: Not required (CPU-based processing)
- **Network**: Stable internet connection

### Production Environment
- **CPU**: 2+ vCPUs for small deployments, 4+ vCPUs for production
- **RAM**: 4GB minimum, 8GB+ recommended
- **Storage**: 20GB+ SSD storage
- **Bandwidth**: 100GB+ monthly transfer
- **Uptime**: 99.9% availability target

### Data Processing Limits
- **Maximum CSV file size**: 50MB (configurable)
- **Maximum rows per dataset**: 100,000 rows
- **Maximum columns**: 100 columns
- **Concurrent users**: 100+ (depends on server resources)
- **Analysis timeout**: 5 minutes per clustering operation

## Software Requirements

### Runtime Dependencies
```json
{
  "node": ">=18.0.0",
  "npm": ">=8.0.0",
  "browsers": [
    "Chrome >= 90",
    "Firefox >= 88",
    "Safari >= 14",
    "Edge >= 90"
  ]
}
```

### Core Dependencies
- **React**: ^18.3.1 - UI framework
- **TypeScript**: ^5.5.3 - Type safety
- **Vite**: ^5.4.2 - Build tool and dev server
- **Tailwind CSS**: ^3.4.1 - Styling framework
- **Recharts**: ^3.2.1 - Data visualization
- **Lucide React**: ^0.344.0 - Icon library
- **Supabase**: ^2.57.4 - Backend services

### Development Dependencies
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Supabase      │    │   External      │
│   (React/TS)    │◄──►│   Backend       │◄──►│   Services      │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Data Upload   │    │ • Authentication│    │ • CDN           │
│ • Visualization │    │ • Database      │    │ • Analytics     │
│ • Analysis      │    │ • Storage       │    │ • Monitoring    │
│ • Export        │    │ • Edge Functions│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
src/
├── components/           # React components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Navigation.tsx   # Navigation component
│   ├── AuthForm.tsx     # Authentication forms
│   ├── DataUpload.tsx   # File upload interface
│   ├── DataPreview.tsx  # Data table preview
│   ├── ClusteringConfiguration.tsx
│   ├── ClusteringAnalysis.tsx
│   ├── RFMAnalysis.tsx
│   ├── ClusteringHistory.tsx
│   └── ProfileModal.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Theme management
├── lib/                 # Utility libraries
│   ├── clustering.ts    # K-means algorithm
│   ├── rfm.ts          # RFM analysis
│   ├── csv.ts          # CSV processing
│   └── supabase.ts     # Database client
├── types/              # TypeScript definitions
│   └── index.ts
└── App.tsx             # Main application
```

## Technology Stack

### Frontend Technologies
- **React 18**: Component-based UI framework
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **Recharts**: Declarative charting library
- **Lucide React**: Feather-based icon library

### Backend Technologies
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database
  - Authentication service
  - Real-time subscriptions
  - Edge functions
  - Storage buckets

### Development Tools
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes
- **Git**: Version control

### Algorithms and Libraries
- **K-Means Clustering**: Custom implementation
- **Elbow Method**: Optimal cluster detection
- **RFM Analysis**: Customer segmentation
- **Silhouette Score**: Cluster quality measurement

## Database Schema

### User Management
```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Application Tables
```sql
-- Datasets table
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  data JSONB NOT NULL,
  row_count INTEGER NOT NULL,
  column_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clustering results table
CREATE TABLE clustering_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('clustering', 'rfm')),
  k INTEGER,
  features TEXT[] NOT NULL,
  clusters JSONB NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  default_k INTEGER DEFAULT 3,
  auto_k BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clustering_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own datasets"
  ON datasets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own results"
  ON clustering_results FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

## API Documentation

### Authentication Endpoints
```typescript
// Sign up
POST /auth/signup
Body: { email: string, password: string }
Response: { user: User, session: Session }

// Sign in
POST /auth/signin
Body: { email: string, password: string }
Response: { user: User, session: Session }

// Sign out
POST /auth/signout
Response: { success: boolean }
```

### Data Management
```typescript
// Upload dataset
POST /api/datasets
Body: FormData (CSV file)
Response: { dataset: Dataset }

// Get user datasets
GET /api/datasets
Response: { datasets: Dataset[] }

// Delete dataset
DELETE /api/datasets/:id
Response: { success: boolean }
```

### Analysis Endpoints
```typescript
// Run clustering analysis
POST /api/analysis/clustering
Body: {
  datasetId: string,
  features: string[],
  k?: number,
  autoK: boolean
}
Response: { result: ClusteringResult }

// Run RFM analysis
POST /api/analysis/rfm
Body: {
  datasetId: string,
  recencyField: string,
  frequencyField: string,
  monetaryField: string
}
Response: { result: RFMResult }

// Get analysis history
GET /api/analysis/history
Response: { results: AnalysisResult[] }
```

## Security Implementation

### Authentication Security
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt with salt rounds
- **Email Verification**: Optional email confirmation
- **Session Timeout**: Configurable session expiry
- **CSRF Protection**: Built-in CSRF tokens

### Data Security
- **Row Level Security**: Database-level access control
- **Input Validation**: Server-side data validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **File Upload Security**: MIME type validation, size limits

### Network Security
- **HTTPS Only**: SSL/TLS encryption in production
- **CORS Configuration**: Restricted cross-origin requests
- **Rate Limiting**: API request throttling
- **Environment Variables**: Secure credential storage

### Privacy Compliance
- **Data Minimization**: Only collect necessary data
- **Data Retention**: Configurable data retention policies
- **User Consent**: Clear privacy policy and terms
- **Data Export**: User data portability
- **Right to Deletion**: Account and data deletion

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Responsive images and lazy loading
- **Caching Strategy**: Browser caching for static assets
- **Virtual Scrolling**: Large dataset handling

### Backend Optimization
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching Layer**: Redis for frequently accessed data
- **CDN Integration**: Global content delivery
- **Compression**: Gzip/Brotli compression

### Algorithm Performance
- **K-Means Optimization**: Efficient centroid calculation
- **Memory Management**: Streaming for large datasets
- **Parallel Processing**: Web Workers for heavy computations
- **Progress Tracking**: Real-time analysis progress
- **Timeout Handling**: Graceful handling of long operations

### Scalability Metrics
- **Response Time**: < 2 seconds for analysis
- **Throughput**: 100+ concurrent users
- **Data Processing**: 10,000+ rows in < 30 seconds
- **Memory Usage**: < 512MB per analysis
- **Storage Growth**: Linear with user data

## Deployment Guide

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd segmentai

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
# Configure environment variables
```

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_NAME=SegmentAI
VITE_APP_VERSION=1.0.0
VITE_MAX_FILE_SIZE=52428800  # 50MB
VITE_MAX_ROWS=100000
```

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Deployment Options

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify Deployment
```bash
# Build command: npm run build
# Publish directory: dist
# Environment variables: Configure in Netlify dashboard
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Development Setup

### Prerequisites
```bash
# Check Node.js version
node --version  # Should be 18.0.0+

# Check npm version
npm --version   # Should be 8.0.0+
```

### Local Development
```bash
# 1. Clone and setup
git clone <repository-url>
cd segmentai
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### Development Workflow
```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
- **ESLint**: Automated code linting
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (recommended)
- **Husky**: Git hooks for quality checks
- **Conventional Commits**: Standardized commit messages

## Testing Strategy

### Testing Levels
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Full user workflow testing
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Vulnerability assessment

### Testing Tools (Recommended)
```json
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "playwright": "^1.40.0",
  "cypress": "^13.0.0"
}
```

### Test Coverage Targets
- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: Critical user paths
- **E2E Tests**: Main user workflows
- **Performance Tests**: Load testing scenarios

## Monitoring and Logging

### Application Monitoring
- **Error Tracking**: Sentry or similar service
- **Performance Monitoring**: Web Vitals tracking
- **User Analytics**: Privacy-compliant analytics
- **Uptime Monitoring**: Service availability checks

### Logging Strategy
```typescript
// Log levels
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Logging interface
interface Logger {
  error(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
}
```

### Key Metrics
- **User Engagement**: Active users, session duration
- **Performance**: Page load times, API response times
- **Errors**: Error rates, crash reports
- **Business**: Analysis completion rates, export usage

## Troubleshooting

### Common Issues

#### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### Environment Issues
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify Supabase connection
# Check Supabase dashboard for project status
```

#### Performance Issues
- **Large datasets**: Implement pagination and virtual scrolling
- **Slow clustering**: Optimize algorithm or use Web Workers
- **Memory leaks**: Check for proper cleanup in useEffect hooks
- **Bundle size**: Analyze bundle and implement code splitting

#### Browser Compatibility
- **Modern browsers**: Ensure ES2020+ support
- **Polyfills**: Add polyfills for older browsers if needed
- **CSS compatibility**: Test across different browsers
- **JavaScript features**: Check feature support

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'segmentai:*');

// Disable debug logging
localStorage.removeItem('debug');
```

### Support Channels
- **Documentation**: Check this technical documentation
- **Issue Tracker**: GitHub issues for bug reports
- **Community**: Discord/Slack for community support
- **Email Support**: Technical support email

---

## Appendix

### Glossary
- **K-Means**: Unsupervised clustering algorithm
- **RFM**: Recency, Frequency, Monetary analysis
- **Silhouette Score**: Cluster quality metric
- **Elbow Method**: Optimal cluster number detection
- **CSV**: Comma-Separated Values file format
- **JWT**: JSON Web Token for authentication
- **RLS**: Row Level Security in PostgreSQL

### References
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### Version History
- **v1.0.0**: Initial release with K-Means and RFM analysis
- **v1.1.0**: Added dark theme and improved UX
- **v1.2.0**: Performance optimizations and bug fixes

---

*Last updated: December 2024*
*Document version: 1.0*
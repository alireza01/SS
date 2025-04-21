# Deployment Guide

## Prerequisites

- Vercel account
- Supabase account
- Domain name (optional)
- Stripe account (for payments)
- Google Cloud account (for AI features)

## Environment Setup

### Production Environment Variables

Set up the following environment variables in your Vercel project:

```env
# App
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Google AI
GOOGLE_AI_API_KEY=your_production_google_ai_key

# Stripe
STRIPE_SECRET_KEY=your_production_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_production_webhook_secret
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=your_production_price_id
```

### Staging Environment Variables

Set up similar variables for staging, with appropriate staging values.

## Deployment Environments

### Production (https://app.project-y.com)

1. Automatic deployments from tagged releases
2. Manual promotion from staging
3. Zero-downtime deployments
4. Automatic SSL/TLS certificates

### Staging (https://staging.project-y.com)

1. Automatic deployments from `main` branch
2. Preview deployments for pull requests
3. Testing environment for new features
4. Isolated database instance

## Deployment Process

### 1. Database Migration

1. Test migrations locally:
```bash
supabase migration up
```

2. Apply to staging:
```bash
supabase db push --db-url=$STAGING_DATABASE_URL
```

3. Verify in staging environment
4. Apply to production during deployment

### 2. Application Deployment

#### Automatic Deployment

1. Push to `main` branch for staging:
```bash
git push origin main
```

2. Create and push tag for production:
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Manual Deployment

1. Build the application:
```bash
pnpm build
```

2. Deploy to Vercel:
```bash
vercel --prod
```

### 3. Post-Deployment Verification

1. Check application health
2. Verify database migrations
3. Test critical functionality
4. Monitor error rates
5. Check performance metrics

## Monitoring

### Application Monitoring

1. Vercel Analytics Dashboard
   - Response times
   - Error rates
   - Edge function metrics

2. Supabase Dashboard
   - Database performance
   - Query analytics
   - Storage usage

3. Custom Monitoring
   - Error tracking
   - User analytics
   - Performance metrics

### Health Checks

1. API Health Check
   - Endpoint: `/api/health`
   - Checks: Database, cache, external services

2. Database Health Check
   - Connection pool
   - Query performance
   - Storage usage

3. External Services Check
   - Stripe connectivity
   - Google AI API status
   - Storage service status

## Backup and Recovery

### Database Backups

1. Automated daily backups
2. Point-in-time recovery
3. Manual backup before major changes

### Recovery Procedures

1. Database restore:
```bash
supabase db restore --db-url=$DATABASE_URL --backup-file=backup.sql
```

2. Application rollback:
```bash
git checkout v1.0.0
vercel --prod
```

## Security Measures

### SSL/TLS Configuration

1. Force HTTPS
2. HSTS enabled
3. Modern TLS versions only

### Access Control

1. IP allowlisting for admin panel
2. Role-based access control
3. API rate limiting

### Data Protection

1. Database encryption at rest
2. Secure environment variables
3. Regular security audits

## Troubleshooting

### Common Issues

1. Database Connection Issues
   - Check connection strings
   - Verify network access
   - Check connection pools

2. Build Failures
   - Check build logs
   - Verify dependencies
   - Check environment variables

3. Runtime Errors
   - Check application logs
   - Monitor error tracking
   - Verify configurations

### Recovery Steps

1. Immediate Actions
   - Check error logs
   - Notify team
   - Assess impact

2. Resolution
   - Identify root cause
   - Apply fix
   - Verify solution

3. Prevention
   - Update documentation
   - Add monitoring
   - Implement safeguards

## Scaling

### Database Scaling

1. Connection pooling
2. Read replicas
3. Horizontal scaling

### Application Scaling

1. Edge functions
2. Caching strategies
3. CDN optimization

## Maintenance

### Regular Tasks

1. Update dependencies
2. Security patches
3. Performance optimization

### Schedule

1. Daily
   - Monitor logs
   - Check metrics
   - Verify backups

2. Weekly
   - Review performance
   - Check security
   - Update documentation

3. Monthly
   - Dependency updates
   - Security audits
   - Capacity planning 
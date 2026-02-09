# MusicApp - Railway Deployment Guide

Deploy your full-stack MusicApp to Railway in minutes with free tier credits!

## Quick Start (Fastest)

### 1. **Sign Up on Railway**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub (1 click)
- You'll get $5/month free credits

### 2. **Deploy from Repository**
```bash
# Option A: Via Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up

# Option B: Via Web Dashboard (Easiest)
# 1. Go to Railway dashboard
# 2. Click "New Project" → "Deploy from GitHub repo"
# 3. Select Possibilityofendless/Musicapp
# 4. Select docker-compose.yml deployment
# 5. Wait 2-5 minutes
```

### 3. **Set Environment Variables**
In Railway Dashboard → Variables tab, add:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here-change-this
OPENAI_API_KEY=sk-your-key-here (required for Sora API)
USE_SORA_MOCK=false # set true only for non-production mocks
```

### 4. **Access Your App**
- Frontend: `https://frontend-xxxxx.railway.app`
- Backend API: `https://backend-xxxxx.railway.app`
- API Docs: `https://backend-xxxxx.railway.app/`

---

## Services Deployed

| Service | Status | Railway Service |
|---------|--------|-----------------|
| Frontend (React) | ✅ Nginx | Automatic |
| Backend (Node.js) | ✅ Express | Automatic |
| Database (PostgreSQL) | ✅ Managed | Automatic |
| Cache (Redis) | ✅ Managed | Automatic |
| Workers (Python) | ✅ Async | Automatic |

---

## Cost Estimate (Free Tier)

- **First Month**: FREE ($5 credit)
- **After**: ~$5-15/month for small usage
  - PostgreSQL: ~$0.80/GB
  - Redis: ~$5/instance
  - Egress: ~$0.50/GB

[Railway Pricing](https://railway.app/pricing)

---

## Troubleshooting

### Services Not Starting?
```bash
# View logs
railway logs

# Restart services
railway restart
```

### Database Connection Failing?
1. Railway auto-injects `DATABASE_URL` and `REDIS_URL`
2. No manual config needed
3. Check Environment Variables tab

### Frontend Not Loading?
1. Set `VITE_API_URL` to your backend URL
2. Rebuild frontend: `railway redeploy frontend`

---

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Add `OPENAI_API_KEY` for Sora video generation
- [ ] Enable auto-backups for PostgreSQL
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (optional)
- [ ] Enable SSL (automatic on Railway)

---

## Next Steps

1. **Add Your API Key**: Go to [OpenAI](https://platform.openai.com/api-keys) to get Sora API key
2. **Create Demo User**: Use `/api/auth/signup` to create initial user
3. **Test Endpoints**:
   ```bash
   # Health check
   curl https://backend-xxxxx.railway.app/health
   
   # API info
   curl https://backend-xxxxx.railway.app/
   ```

---

## Support

- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/Possibilityofendless/Musicapp/issues

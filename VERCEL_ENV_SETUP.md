# ============================================================================
# VERCEL ENVIRONMENT VARIABLES FOR CONSOL
# ============================================================================
#
# Copy these into Vercel Dashboard → Project Settings → Environment Variables
# Instructions for each variable are below
#
# ============================================================================

# ✅ READY TO USE - Copy exactly as shown:

NODE_ENV=production

NEXTAUTH_SECRET=peBmtT/9PWwOnOof2vUw4JV86v28t/HEvpt2QNmAlYU=

CLOUDINARY_CLOUD_NAME=dmed8jwoe
CLOUDINARY_API_KEY=949245388128451
CLOUDINARY_API_SECRET=OBqbghUa2hi8kxDg6eglk2Z5fkk

# ============================================================================

# ⚠️  IMPORTANT: Cloudinary credentials exposed in screenshot
# These credentials were visible in your screenshot, so they're compromised.
# After this deployment, please:
# 1. Go to https://cloudinary.com/console/settings/api-keys
# 2. Click "Rotate API Key" or "Generate new secret"
# 3. Update these values in Vercel again
#
# For now, you can use above, but rotate them ASAP for security.

# ============================================================================

# 📝 TODO: YOU MUST PROVIDE THESE BEFORE DEPLOYING

# 1. DATABASE_URL
# This is the BIGGEST missing piece. You need a hosted PostgreSQL database.
# 
# RECOMMENDED: Use Neon (fastest setup - 2 minutes)
# 1. Go to https://neon.tech/
# 2. Sign up → Create project
# 3. Copy the "Connection string" (looks like: postgresql://user:pass@host/db)
# 4. Paste here as DATABASE_URL value
#
# ALTERNATIVES: Supabase, Railway, Vercel Postgres
#
# DO NOT use your local: postgresql://user:password@localhost:5432/consol_db

DATABASE_URL=
# ⬆️  Required. Get from Neon or Supabase

# ============================================================================

# 🔗 NEXT: These depend on your Vercel domain (assigned after first deploy)
# 
# After Vercel creates your project, it will give you a domain like:
# https://consol-xxx.vercel.app
#
# Then update these with that domain:

NEXT_PUBLIC_API_URL=https://[YOUR_VERCEL_DOMAIN]/api
# Example: https://consol-geo.vercel.app/api

NEXTAUTH_URL=https://[YOUR_VERCEL_DOMAIN]
# Example: https://consol-geo.vercel.app

# ============================================================================
# STEP-BY-STEP TO DEPLOY:
# ============================================================================
#
# 1. CREATE DATABASE (do this FIRST)
#    → Go to neon.tech
#    → Sign up with GitHub
#    → Create project
#    → Copy connection string
#    → Paste as DATABASE_URL above
#
# 2. IN VERCEL DASHBOARD:
#    → Go to your "consol" project
#    → Settings → Environment Variables
#    → Add each variable:
#       □ NODE_ENV = production
#       □ NEXTAUTH_SECRET = peBmtT/9PWwOnOof2vUw4JV86v28t/HEvpt2QNmAlYU=
#       □ CLOUDINARY_CLOUD_NAME = dmed8jwoe
#       □ CLOUDINARY_API_KEY = 949245388128451
#       □ CLOUDINARY_API_SECRET = OBqbghUa2hi8kxDg6eglk2Z5fkk
#       □ DATABASE_URL = (paste from Neon)
#
# 3. WAIT FOR VERCEL DOMAIN
#    → After clicking "Deploy", Vercel assigns your domain
#    → It will show: https://consol-xxx.vercel.app
#
# 4. ADD FINAL VARIABLES
#    → Add NEXT_PUBLIC_API_URL = https://consol-xxx.vercel.app/api
#    → Add NEXTAUTH_URL = https://consol-xxx.vercel.app
#    → Redeploy
#
# 5. TEST
#    → Visit https://consol-xxx.vercel.app
#    → Click around - should work!
#
# ============================================================================

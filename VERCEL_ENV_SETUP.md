# Vercel Environment Variables Setup

## Required Environment Variables for Production

In your Vercel project dashboard, go to **Settings → Environment Variables** and add the following:

### API Keys (Required for AI functionality)
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
OPENAI_API_KEY=your_actual_openai_api_key_here
GLM_API_KEY=your_actual_glm_api_key_here
```

### Authentication (Required)
```
JWT_SECRET=your_strong_random_secret_key_here
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_strong_admin_password_here
```

### Application Configuration
```
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
NODE_ENV=production
```

### Optional: Ecount ERP Integration
```
ECOUNT_SESSION_ID=your_ecount_session_id
ECOUNT_ZONE=BB
```

## Steps to Set Up:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to Settings → Environment Variables

2. **Add Each Variable**
   - Click "Add New"
   - Enter the variable name and value
   - Select the appropriate environment (Production, Preview, Development)
   - Save

3. **Important Notes:**
   - Never commit actual API keys to git
   - Use strong, unique secrets for JWT_SECRET
   - Make sure to add all variables to Production environment
   - Redeploy after adding environment variables

4. **Testing:**
   After deployment, test your setup by visiting:
   ```
   https://your-app-url.vercel.app/api/health
   ```

   This will show which environment variables are properly configured.

## Common Issues and Solutions:

### Issue: 500 Internal Server Error
- **Cause**: Missing environment variables
- **Solution**: Ensure all required environment variables are set in Vercel dashboard

### Issue: Authentication errors
- **Cause**: Missing JWT_SECRET or incorrect admin credentials
- **Solution**: Set JWT_SECRET and ADMIN_EMAIL/ADMIN_PASSWORD

### Issue: AI API not working
- **Cause**: Missing or invalid API keys
- **Solution**: Verify API keys are correct and have sufficient quota

### Issue: CORS errors
- **Solution**: The updated configuration should handle CORS, but ensure your frontend is using the correct URL
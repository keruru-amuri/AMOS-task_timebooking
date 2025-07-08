# Quick HTTPS Setup for Camera Access

## Immediate Solution (5 minutes):

### Option A: Using ngrok (Recommended)

1. **Install ngrok globally:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your app:**
   ```bash
   npm run dev
   ```

3. **In a NEW terminal, create HTTPS tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (something like `https://abc123.ngrok.io`)

5. **Open that HTTPS URL on your mobile device**

6. **Camera should now work!**

### Option B: Using the automated script

1. **Run the combined command:**
   ```bash
   npm run dev:tunnel
   ```

2. **Wait for ngrok to show the HTTPS URL**

3. **Use that URL on your mobile device**

## Why This Works:

- **HTTP (localhost:3000)**: ❌ Camera blocked by browser security
- **HTTPS (ngrok tunnel)**: ✅ Camera access allowed

## Troubleshooting:

### If ngrok installation fails:
1. Download ngrok manually from https://ngrok.com/download
2. Extract to a folder in your PATH
3. Run `ngrok http 3000`

### If camera still doesn't work:
1. Make sure you're using the HTTPS URL (starts with `https://`)
2. Allow camera permissions when prompted
3. Try refreshing the page
4. Check if your mobile browser supports camera API

### Alternative: Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Then use the provided HTTPS URL.

## Security Note:
ngrok creates a public tunnel to your local server. Only use this for development and testing!

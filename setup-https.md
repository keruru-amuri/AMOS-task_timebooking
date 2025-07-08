# HTTPS Setup for Camera Access

Camera access requires HTTPS in modern browsers. Here are several solutions:

## Solution 1: ngrok (Recommended - Easiest)

1. **Install ngrok:**
   - Download from https://ngrok.com/download
   - Or install via npm: `npm install -g ngrok`

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, create HTTPS tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Use the HTTPS URL provided by ngrok on your mobile device**
   - Example: `https://abc123.ngrok.io`

## Solution 2: Local HTTPS with mkcert

1. **Install mkcert:**
   ```bash
   # Windows (using Chocolatey)
   choco install mkcert
   
   # Or download from: https://github.com/FiloSottile/mkcert/releases
   ```

2. **Create local CA:**
   ```bash
   mkcert -install
   ```

3. **Generate certificates:**
   ```bash
   mkcert localhost 127.0.0.1 ::1 your-local-ip
   ```

4. **Update package.json:**
   ```json
   {
     "scripts": {
       "dev": "next dev --turbopack -H 0.0.0.0",
       "dev-https": "HTTPS=true SSL_CRT_FILE=./localhost+3.pem SSL_KEY_FILE=./localhost+3-key.pem next dev -H 0.0.0.0 -p 3000"
     }
   }
   ```

## Solution 3: Use Vercel for deployment

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Access via the provided HTTPS URL**

## Solution 4: Cloudflare Tunnel

1. **Install cloudflared:**
   - Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

2. **Create tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

## Quick Start with ngrok:

1. Start your app: `npm run dev`
2. Install ngrok: `npm install -g ngrok`
3. Create tunnel: `ngrok http 3000`
4. Use the HTTPS URL on your mobile device

The camera should now work properly!

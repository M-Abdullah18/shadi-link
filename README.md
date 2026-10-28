# ShaadiLink 💍

Premium digital wedding invitations and guest management platform crafted for Pakistani weddings. Featuring bespoke bilingual (English & Urdu RTL) templates, interactive animated invitations, personal guest links, and one-tap WhatsApp integration.

---

## Deploying on Vercel

ShaadiLink is architected to deploy seamlessly on Vercel as a full-stack application (Vite SPA frontend + Express Serverless API).

### Environment Variables on Vercel

Configure the following environment variables in your Vercel Project Settings (**Settings > Environment Variables**):

| Variable | Requirement | Description |
| :--- | :--- | :--- |
| `ADMIN_EMAIL` | Required | Email address for site administrator login (e.g. `admin@shaadilink.pk`). |
| `ADMIN_PASSWORD` | Required (Min 12 chars) | Secure admin password. Must be at least 12 characters in production. |
| `SESSION_SECRET` | Required (40+ chars) | Long random string (40+ characters) used for signing JWT session cookies. |
| `VITE_WHATSAPP_NUMBER` | Required | Central WhatsApp phone number for inquiries and orders (e.g. `923246540244`). |
| `NODE_ENV` | Optional | Set to `production` by Vercel automatically. |

### Build Settings on Vercel

Configured automatically via `vercel.json`:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **API Serverless Handler**: `api/index.ts`

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript checks
npm run lint

# Compile production bundle
npm run build

# Run automated security test suite
npm run test:auth
```

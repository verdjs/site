# Cloudflare Pages Functions

This directory contains serverless functions for the verdis.pages.dev site.

## Setup

### Environment Variables

The following environment variable must be configured in your Cloudflare Pages project:

- `API_KEY` - Your zimage API key for image generation

#### How to set environment variables in Cloudflare Pages:

1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings** → **Environment variables**
3. Add the variable:
   - **Variable name**: `API_KEY`
   - **Value**: Your zimage API key
   - **Environment**: Production (and Preview if needed)
4. Click **Save**

## Functions

### `/api/generate-image`

**Method**: POST  
**Endpoint**: `/api/generate-image`

Securely generates images using the zimage API without exposing the API key to the client.

**Request Body**:
```json
{
  "prompt": "A description of the image to generate"
}
```

**Response**: Image binary data (PNG/JPEG)

**Error Response**:
```json
{
  "error": "Error message"
}
```

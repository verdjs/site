## how to deploy to cloudflare pages (pages.dev)
1. fork repo
2. log in to cloudflare

now choose how you wanna do this

#### through cli (super reliable)
1. open up the forked repo on ur pc and install wrangler if you dont have it (npm i -g wrangler)
2. do `wrangler pages project create your-project-name`
3. once complete, do `wrangler pages deploy ./`

#### through dashboard
1. go to workers/pages
2. click new application
3. click "looking to deploy pages?" or smth
4. import the repo
5. follow the steps do deploy

### setting up api_key for image generation
The assistant AI uses the zimage API for image generation which requires an API key.

1. In your Cloudflare Pages dashboard, go to your project
2. Navigate to Settings > Environment variables
3. Add a new environment variable:
   - Variable name: `API_KEY`
   - Value: Your zimage API key
4. Save and redeploy your project

The API key will be automatically used by the `/functions/api/config.js` serverless function to securely provide the key to the frontend.
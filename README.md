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

### assistant ai features
The assistant AI page includes:
- **Text generation**: Uses the public pollinations.ai endpoint (no API key needed)
- **Image generation**: Uses zimage API with 2k resolution (2048x2048) through a secure serverless function

**Important**: You must set the `API_KEY` environment variable in your Cloudflare Pages project settings for image generation to work. See `functions/README.md` for setup instructions.
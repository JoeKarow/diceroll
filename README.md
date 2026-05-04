# Discord Dice Roller Bot

A Discord bot hosted on Cloudflare Workers that responds to `/roll` slash commands for dice rolling.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it
3. Go to "Bot" section and create a bot
4. Copy the **Application ID** and **Public Key** from the "General Information" page
5. Copy the **Bot Token** from the "Bot" page

### 3. Configure Secrets

For local development, edit `.dev.vars`:

```
DISCORD_APPLICATION_ID=your_application_id
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_TOKEN=your_bot_token
```

For production, set secrets via Wrangler:

```bash
wrangler secret put DISCORD_APPLICATION_ID
wrangler secret put DISCORD_PUBLIC_KEY
wrangler secret put DISCORD_TOKEN
```

### 4. Create KV Namespace

The bot remembers the active game per Discord server in a KV namespace bound as `GAME_STATE`.

```bash
wrangler kv namespace create GAME_STATE
wrangler kv namespace create GAME_STATE --preview
```

Paste the returned IDs into the `[[kv_namespaces]]` block in `wrangler.toml` (replace `REPLACE_WITH_KV_ID` and `REPLACE_WITH_KV_PREVIEW_ID`).

### 5. Register Slash Commands

```bash
# Load secrets from .dev.vars and register commands
source <(grep -v '^#' .dev.vars | xargs -I {} echo export {}) && pnpm register
```

### 6. Deploy

```bash
pnpm deploy
```

### 7. Configure Discord Webhook

1. After deploying, copy your Worker URL (e.g., `https://diceroll.your-subdomain.workers.dev`)
2. Go to Discord Developer Portal > Your Application > General Information
3. Set **Interactions Endpoint URL** to your Worker URL
4. Discord will verify the endpoint automatically

### 8. Invite Bot to Server

1. Go to Discord Developer Portal > Your Application > OAuth2
2. Under "OAuth2 URL Generator":
   - Select scope: `applications.commands`
3. Copy the generated URL and open it to invite the bot

## Usage

Roll dice with the `/roll` command in any channel:

- `/roll 2d6` - Roll 2 six-sided dice
- `/roll 1d20+5` - Roll 1d20 with +5 modifier
- `/roll 3d8-2` - Roll 3d8 with -2 modifier
- `/roll d20` - Roll a single d20

The result table's success row depends on the active game for the server. Switch games with `/game`:

- `/game` - Show the current game (defaults to Monster of the Week)
- `/game motw` - Switch to Monster of the Week (2d6+mod, ≤6 fail / 7-9 mixed / 10+ full)
- `/game tethers` - Switch to Tethers (single d6/d8/d10/d12/d20, ≥5 success)

## Development

Start local development server:

```bash
pnpm dev
```

For testing with Discord, you'll need to expose your local server using a tool like ngrok:

```bash
ngrok http 8787
```

Then set the ngrok URL as your Interactions Endpoint URL in Discord.

import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from "discord-interactions";
import { parseDiceNotation, rollDice, formatResult } from "./dice";
import {
  DEFAULT_GAME,
  GAMES,
  GameId,
  parseGameId,
} from "./games";

interface Env {
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
  GAME_STATE: KVNamespace;
}

interface DiscordInteraction {
  type: number;
  guild_id?: string;
  data?: {
    name: string;
    options?: Array<{
      name: string;
      value: string;
    }>;
  };
}

async function getGame(env: Env, guildId: string | undefined): Promise<GameId> {
  if (!guildId) return DEFAULT_GAME;
  const stored = await env.GAME_STATE.get(guildId);
  return stored ? parseGameId(stored) ?? DEFAULT_GAME : DEFAULT_GAME;
}

async function setGame(env: Env, guildId: string, game: GameId): Promise<void> {
  await env.GAME_STATE.put(guildId, game);
}

function reply(content: string): Response {
  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Verify the request signature
    const signature = request.headers.get("X-Signature-Ed25519");
    const timestamp = request.headers.get("X-Signature-Timestamp");
    const body = await request.text();

    if (!signature || !timestamp) {
      return new Response("Bad request", { status: 401 });
    }

    const isValid = await verifyKey(
      body,
      signature,
      timestamp,
      env.DISCORD_PUBLIC_KEY
    );

    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const interaction: DiscordInteraction = JSON.parse(body);

    // Handle PING (type 1) - Discord's URL verification
    if (interaction.type === InteractionType.PING) {
      return Response.json({ type: InteractionResponseType.PONG });
    }

    // Handle APPLICATION_COMMAND (type 2)
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name, options } = interaction.data!;
      const guildId = interaction.guild_id;

      if (name === "game") {
        const nameOption = options?.find((opt) => opt.name === "name");

        if (!nameOption) {
          const current = await getGame(env, guildId);
          return reply(`Current game: **${GAMES[current].displayName}**`);
        }

        if (!guildId) {
          return reply("The `/game` command can only be used in a server.");
        }

        const requested = parseGameId(nameOption.value);
        if (!requested) {
          return reply(`Unknown game: \`${nameOption.value}\`.`);
        }

        await setGame(env, guildId, requested);
        return reply(`Switched to **${GAMES[requested].displayName}**`);
      }

      if (name === "roll") {
        const diceOption = options?.find((opt) => opt.name === "dice");
        const diceNotation = diceOption?.value ?? "1d20";

        const parsed = parseDiceNotation(diceNotation);

        if (!parsed) {
          return reply(
            `Invalid dice notation: \`${diceNotation}\`. Use format like \`2d6\`, \`1d20+5\`, or \`3d8-2\`.`
          );
        }

        const game = GAMES[await getGame(env, guildId)];
        const validationError = game.validate(parsed);
        if (validationError) {
          return reply(validationError);
        }

        const result = rollDice(parsed);
        const message = formatResult(result, game.tier(result));

        return reply(message);
      }
    }

    return reply("Unknown command");
  },
};

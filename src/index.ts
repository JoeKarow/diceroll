import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from "discord-interactions";
import { parseDiceNotation, rollDice, formatResult } from "./dice";

interface Env {
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
}

interface DiscordInteraction {
  type: number;
  data?: {
    name: string;
    options?: Array<{
      name: string;
      value: string;
    }>;
  };
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

      if (name === "roll") {
        const diceOption = options?.find((opt) => opt.name === "dice");
        const diceNotation = diceOption?.value ?? "1d20";

        const parsed = parseDiceNotation(diceNotation);

        if (!parsed) {
          return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Invalid dice notation: \`${diceNotation}\`. Use format like \`2d6\`, \`1d20+5\`, or \`3d8-2\`.`,
            },
          });
        }

        const result = rollDice(parsed);
        const message = formatResult(result);

        return Response.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: message,
          },
        });
      }
    }

    return Response.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Unknown command",
      },
    });
  },
};

import { commands } from "./commands";

const DISCORD_API_URL = "https://discord.com/api/v10";

async function registerCommands() {
  const applicationId = process.env.DISCORD_APPLICATION_ID;
  const token = process.env.DISCORD_TOKEN;

  if (!applicationId || !token) {
    console.error("Missing environment variables:");
    console.error("  DISCORD_APPLICATION_ID:", applicationId ? "set" : "missing");
    console.error("  DISCORD_TOKEN:", token ? "set" : "missing");
    console.error("\nSet these in .dev.vars or as environment variables.");
    process.exit(1);
  }

  const url = `${DISCORD_API_URL}/applications/${applicationId}/commands`;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bot ${token}`,
  };

  // Fetch existing commands so we can preserve any Entry Point command (type 4),
  // which Discord refuses to drop in a bulk PUT.
  const existingResponse = await fetch(url, { headers: authHeaders });
  if (!existingResponse.ok) {
    const error = await existingResponse.text();
    console.error(
      "Failed to fetch existing commands:",
      existingResponse.status,
      error
    );
    process.exit(1);
  }
  const existing = (await existingResponse.json()) as Array<{ type?: number }>;
  const entryPointCommands = existing.filter((cmd) => cmd.type === 4);

  console.log("Registering commands...");

  const response = await fetch(url, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify([...commands, ...entryPointCommands]),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to register commands:", response.status, error);
    process.exit(1);
  }

  const data = await response.json();
  console.log("Commands registered successfully:");
  console.log(JSON.stringify(data, null, 2));
}

registerCommands();

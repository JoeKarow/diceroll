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

  console.log("Registering commands...");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify(commands),
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

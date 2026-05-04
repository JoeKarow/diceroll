export const ROLL_COMMAND = {
  name: "roll",
  description: "Roll dice using standard notation (e.g., 2d6+2)",
  options: [
    {
      name: "dice",
      description: "Dice notation (e.g., 2d6, 1d20+5, 3d8-2)",
      type: 3, // STRING type
      required: true,
    },
  ],
};

export const GAME_COMMAND = {
  name: "game",
  description: "Show or switch the active game system for this server",
  options: [
    {
      name: "name",
      description: "Game to switch to (omit to see current)",
      type: 3, // STRING type
      required: false,
      choices: [
        { name: "Monster of the Week", value: "motw" },
        { name: "Tethers", value: "tethers" },
      ],
    },
  ],
};

export const commands = [ROLL_COMMAND, GAME_COMMAND];

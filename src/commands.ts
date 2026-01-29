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

export const commands = [ROLL_COMMAND];

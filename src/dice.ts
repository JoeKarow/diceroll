export interface DiceResult {
  rolls: number[];
  modifier: number;
  total: number;
  notation: string;
}

export interface ParsedDice {
  count: number;
  sides: number;
  modifier: number;
}

/**
 * Parse dice notation like "2d6+2", "1d20", "d20", "3d8-2"
 */
export function parseDiceNotation(notation: string): ParsedDice | null {
  const cleaned = notation.toLowerCase().replace(/\s/g, "");
  const match = cleaned.match(/^(\d*)d(\d+)([+-]\d+)?$/);

  if (!match) {
    return null;
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  if (count < 1 || count > 100) {
    return null;
  }
  if (sides < 2 || sides > 1000) {
    return null;
  }

  return { count, sides, modifier };
}

/**
 * Roll dice and return the result
 */
export function rollDice(parsed: ParsedDice): DiceResult {
  const rolls: number[] = [];

  for (let i = 0; i < parsed.count; i++) {
    rolls.push(Math.floor(Math.random() * parsed.sides) + 1);
  }

  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + parsed.modifier;

  let notation = `${parsed.count}d${parsed.sides}`;
  if (parsed.modifier > 0) {
    notation += `+${parsed.modifier}`;
  } else if (parsed.modifier < 0) {
    notation += `${parsed.modifier}`;
  }

  return { rolls, modifier: parsed.modifier, total, notation };
}

/**
 * Format the dice result for display
 */
export function formatResult(result: DiceResult): string {
  const rollsStr = `[${result.rolls.join(", ")}]`;

  if (result.modifier === 0) {
    return `Rolling ${result.notation}: ${rollsStr} = **${result.total}**`;
  }

  const modifierStr =
    result.modifier > 0 ? `+ ${result.modifier}` : `- ${Math.abs(result.modifier)}`;
  return `Rolling ${result.notation}: ${rollsStr} ${modifierStr} = **${result.total}**`;
}

import { AsciiTable3 } from 'ascii-table3';

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
  // Prepare rolls display - append modifier in parentheses with sign
  let rollsContent = result.rolls.join(' ');
  if (result.modifier !== 0) {
    const modSign = result.modifier > 0 ? '+' : '';
    rollsContent += ` (${modSign}${result.modifier})`;
  }
  const sumContent = `[${result.total}]`;

  // Determine success tier
  let successTier: string;
  if (result.total <= 6) {
    successTier = 'FAILED';
  } else if (result.total <= 9) {
    successTier = 'MIXED SUCCESS';
  } else {
    successTier = 'FULL SUCCESS';
  }

  const table = new AsciiTable3(result.notation)
    .setStyle('unicode-single')
    .setHeading('rolls', 'sum')
    .addRow(rollsContent, sumContent);

  // Get table output and manually add spanning success tier row
  let tableStr = table.toString();
  // Remove the last line (bottom border)
  const lines = tableStr.trimEnd().split('\n');
  const bottomBorder = lines.pop()!;
  // Calculate inner width (width between the outer borders)
  const innerWidth = bottomBorder.length - 2;
  // Build the spanning row
  const paddedTier = successTier.padStart(Math.floor((innerWidth + successTier.length) / 2)).padEnd(innerWidth);
  const tierRow = `│${paddedTier}│`;
  // Build new bottom border (no middle junction)
  const newBottom = `└${'─'.repeat(innerWidth)}┘`;
  // Add separator, tier row, and new bottom
  const separator = `├${'─'.repeat(innerWidth)}┤`;

  tableStr = lines.join('\n') + '\n' + separator + '\n' + tierRow + '\n' + newBottom;

  return '```\n' + tableStr + '\n```';
}

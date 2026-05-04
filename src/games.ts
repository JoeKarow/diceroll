import type { DiceResult, ParsedDice } from "./dice";

export type GameId = "motw" | "tethers";

export const GAME_IDS: GameId[] = ["motw", "tethers"];
export const DEFAULT_GAME: GameId = "motw";

export interface GameConfig {
  id: GameId;
  displayName: string;
  validate(parsed: ParsedDice): string | null;
  tier(result: DiceResult): string;
}

const TETHERS_DICE = new Set([6, 8, 10, 12, 20]);

export const GAMES: Record<GameId, GameConfig> = {
  motw: {
    id: "motw",
    displayName: "Monster of the Week",
    validate: () => null,
    tier: (result) => {
      if (result.total <= 6) return "FAILED";
      if (result.total <= 9) return "MIXED SUCCESS";
      return "FULL SUCCESS";
    },
  },
  tethers: {
    id: "tethers",
    displayName: "Tethers",
    validate: (parsed) => {
      if (parsed.count !== 1) {
        return "Tethers rolls a single die.";
      }
      if (parsed.modifier !== 0) {
        return "Tethers does not allow modifiers.";
      }
      if (!TETHERS_DICE.has(parsed.sides)) {
        return "Tethers uses d6, d8, d10, d12, or d20.";
      }
      return null;
    },
    tier: (result) => (result.total >= 5 ? "SUCCESS" : "FAILED"),
  },
};

export function parseGameId(value: string): GameId | null {
  return (GAME_IDS as string[]).includes(value) ? (value as GameId) : null;
}

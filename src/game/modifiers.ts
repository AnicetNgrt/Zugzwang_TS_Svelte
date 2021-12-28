import type { Card } from "./cards"
import type { Entity, Game, PawnBase, PawnPlaced, PawnStaging, Player, TileBase, TileEmpty, TileOccupied } from "./model"
import { is_current_player } from "./model"

export interface Modifier {
    apply(game: Game)
    rollback(game: Game)
    is_allowed(game: Game): boolean
    is_playable(game: Game, player: Player): boolean
}

export function can_play(game: Game, modifier: Modifier, player: Player): boolean {
    if (!is_current_player(game, player)) return false
    if (!modifier.is_allowed(game)) return false
    if (!modifier.is_playable(game, player)) return false
    return true
}

export class InlineModifier implements Modifier {
    constructor(
        public apply: (game: Game) => void,
        public rollback: (game: Game) => void,
        public is_allowed: (game: Game) => boolean,
        public is_playable: (game: Game, player: Player) => boolean,
    ) {}
}
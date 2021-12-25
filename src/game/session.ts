import type { Game, Player, Pawn, Tile } from "./model"
import type { Modifier } from "./modifiers"

export interface GameSession {
    done: Array<Modifier>
    game: Game
    player: Player
    selected_pawn_id: number
    selected_tile_position: { x: number, y: number }
    selected_pawn_filter: (pawn: Pawn) => boolean
    selected_tile_filter: (tile: Tile) => boolean
}

export function apply(session: GameSession, modifier: Modifier): GameSession {
    if (modifier.is_allowed(session.game)) {
        modifier.apply(session.game)
        return {
            ...session,
            done: [...session.done, modifier],
        }
    }
    return session
}
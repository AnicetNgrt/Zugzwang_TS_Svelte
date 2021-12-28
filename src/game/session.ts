import { ModifierEndTurn } from "./gameplay_modifiers"
import type { Game, Player } from "./model"
import type { Modifier } from "./modifiers"
import type { Selector } from "./selectors"

export interface GameSession {
    done: Array<Modifier>
    game: Game
    player: Player
    selector: Selector
    players_metadata: Map<Player, PlayerMetadata>
}

export interface PlayerMetadata {
    readonly name: string
}

export function update_selector(s: GameSession, updater: (_: Selector) => Selector): GameSession {
    s.selector = updater(s.selector)
    return s
}

export function apply(s: GameSession, modifier: Modifier): GameSession {
    if (modifier.is_allowed(s.game)) {
        modifier.apply(s.game)
        s.done.push(modifier)
        return s
    }
    return s
}

export function rollback(s: GameSession): GameSession {
    console.log(s.done[s.done.length-1])
    if (s.done.length > 0 && !(s.done[s.done.length-1] instanceof ModifierEndTurn)) {
        s.done.pop().rollback(s.game)
        return s
    }
    return s
}
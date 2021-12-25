import type { Game, Player } from "./model"
import type { Modifier } from "./modifiers"
import type { Selector } from "./selectors"

export interface GameSession {
    done: Array<Modifier>
    game: Game
    player: Player
    selector: Selector<any, any>
}

export function update_selector(s: GameSession, updater: (_: Selector<any, any>) => Selector<any, any>): GameSession {
    return {
        ...s,
        selector: updater(s.selector)
    }
}

export function apply(s: GameSession, modifier: Modifier): GameSession {
    if (modifier.is_allowed(s.game)) {
        modifier.apply(s.game)
        return {
            ...s,
            done: [...s.done, modifier],
        }
    }
    return s
}
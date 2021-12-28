import type { Selectable, SelectableType } from "."
import type { Pawn, Tile } from "../model"
import type { GameSession } from "../session"

export type SelectableFilter = (session: GameSession, el: Selectable) => boolean

export function type_filter(type: SelectableType): SelectableFilter {
    return (_session: GameSession, el: Selectable): boolean => {
        return el.get_type() == type
    }
}

export function filters(filters: SelectableFilter[]) {
    return (session: GameSession, el: Selectable): boolean => {
        return !filters.some(f => f(session, el) == false)
    }
}

export function filter_as_pawns(filter: (session: GameSession, pawn: Pawn) => boolean): SelectableFilter {
    return filters([
        (session, el) => {
            const pawn = el.as_pawn()
            return filter(session, pawn)
        }
    ])
}

export const filter_pawns: SelectableFilter = type_filter('Pawn')

export const filter_tiles: SelectableFilter = type_filter('Tile')

export function filter_as_tiles(filter: (session: GameSession, tile: Tile) => boolean): SelectableFilter {
    return (session, el) => {
        const tile = el.as_tile()
        return filter(session, tile)
    }
}
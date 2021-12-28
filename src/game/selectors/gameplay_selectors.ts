import { filters, type Selector, filter_pawns_owned_by_session_player_if_current, filter_as_pawns, ChainedSelector, filter_tiles_if_session_player_can_play, OnePawnSelector, OneTileSelector, OrSelector } from "."
import { ModifierMovePawn, ModifierPlacePawn } from "../gameplay_modifiers"
import type { Tile, Pawn } from "../model"
import type { Modifier } from "../modifiers"
import type { GameSession } from "../session"

export function select_one_currently_playable_pawn_if(
    predicate: (session: GameSession, pawn: Pawn) => boolean,
    callback: (pawn: Pawn) => void
): Selector {
    return new OnePawnSelector(
        callback,
        filters([
            filter_pawns_owned_by_session_player_if_current,
            filter_as_pawns(predicate)
        ])
    )
}

export function move_pawn_selector(callback: (modifier: ModifierMovePawn) => void): Selector {
    let selected_pawn_id: number
    let selected_tile: Tile
    
    return new ChainedSelector(
        [
            select_one_currently_playable_pawn_if(
                (_, pawn) => pawn.state == 'Placed',
                pawn => selected_pawn_id = pawn.id
            ),
            new OneTileSelector(
                tile => selected_tile = tile,
                filter_tiles_if_session_player_can_play(
                    (_, tile) => new ModifierMovePawn(selected_pawn_id, { x: tile.x, y: tile.y })
                )
            ),
        ],
        _ => {
            const modifier = new ModifierMovePawn(
                selected_pawn_id, 
                { x: selected_tile.x, y: selected_tile.y }
            )
            callback(modifier)
        }
    )
}

export function place_pawn_selector(callback: (modifier: ModifierPlacePawn) => void): Selector {
    let selected_pawn_id: number
    let selected_tile: Tile
    
    return new ChainedSelector(
        [
            select_one_currently_playable_pawn_if(
                (_, pawn) => pawn.state == 'Staging',
                pawn => selected_pawn_id = pawn.id
            ),
            new OneTileSelector(
                tile => selected_tile = tile,
                filter_tiles_if_session_player_can_play(
                    (_, tile) => new ModifierPlacePawn(selected_pawn_id, { x: tile.x, y: tile.y })
                )
            ),
        ],
        _ => {
            const modifier = new ModifierPlacePawn(
                selected_pawn_id, 
                { x: selected_tile.x, y: selected_tile.y }
            )
            callback(modifier)
        }
    )
}

export function play_selector(callback: (modifier: Modifier) => void): Selector {
    return new OrSelector(
        [
            place_pawn_selector(callback),
            move_pawn_selector(callback),
        ],
        (_) => {}
    )
}
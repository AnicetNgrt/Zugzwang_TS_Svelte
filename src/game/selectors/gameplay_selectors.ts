import { type Selector, OnePawnSelector, filters, filter_pawns_owned_by_session_player_if_current, filter_as_pawns, ChainedSelector, OneTileSelector, filter_tiles_if_session_player_can_play, MergeSelector, OrSelector, DummySelector, filter_pawns_owned_by_enemy_of_session_player_if_current } from "."
import type { CardStack } from "../cards"
import { ModifierConsumeCard, ModifierMovePawn, ModifierPlacePawn, ModifierPlayCard } from "../gameplay_modifiers"
import type { Tile, Pawn, Game, Player } from "../model"
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

export function select_one_enemy_pawn_if(
    predicate: (session: GameSession, pawn: Pawn) => boolean,
    callback: (pawn: Pawn) => void
): Selector {
    return new OnePawnSelector(
        callback,
        filters([
            filter_pawns_owned_by_enemy_of_session_player_if_current,
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

function first_selectable_card_id(card_stack: CardStack, game: Game, player: Player) {
    return card_stack.stack.find(card_id => {
        const card = game.cards.get(card_id)
        const modifier = new ModifierConsumeCard(card.id)
        return modifier.is_allowed(game)
            && modifier.is_playable(game, player)
    })
}

export function displacement_cards_selector(session: GameSession, callback: (modifier: ModifierPlayCard) => void): Selector {
    let selectors = session.game.card_stacks
        .get(session.player)
        .map(card_stack => first_selectable_card_id(card_stack, session.game, session.player))
        .filter(card_id => card_id != undefined)
        .map(card_id => session.game.cards.get(card_id))
        .map(card => card.rebuild_selector(() => {
            console.log(`Playing card ${card.id}`)
            callback(new ModifierPlayCard(card.id))
        }))
    
    if (selectors.length < 1) return new DummySelector()
    
    return new MergeSelector(
        selectors, 
        _ => {}
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

export function play_selector(session: GameSession, callback: (modifier: Modifier) => void): Selector {
    return new OrSelector(
        [
            place_pawn_selector(callback),
            displacement_cards_selector(session, callback)
        ],
        (_) => {}
    )
}
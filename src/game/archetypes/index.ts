import { Archetype, ArchetypeStack } from '../cards'
import { ModifierKillPawn } from '../gameplay_modifiers'
import type { Game, PawnBase, PawnPlaced } from '../model'
import { filters, filter_as_pawns, filter_pawns_owned_by_enemy_of_session_player_if_current, OnePawnSelector, type SelectedTreeLeaf } from '../selectors'

export * from './displacement'

function proximity_enemy_pawns(game: Game, pawn: PawnBase & PawnPlaced): (PawnBase & PawnPlaced)[] {
    return [[0, 1],[0, -1],[-1, 0],[1, 0]].reduce((pawns, [dx, dy]) => {
        const x = pawn.x + dx
        const y = pawn.y + dy
        if (x >= 0 && x < game.rules.width && y >= 0 && y < game.rules.height) {
            const tile = game.board[y][x]
            if (tile.state == 'Occupied') {
                const attacker = game.pawns[tile.pawn_id]
                if (attacker.owner != pawn.owner && attacker.state == 'Placed') {
                    return [...pawns, attacker]
                }
            }
        }
        return pawns
    }, [] as (PawnBase & PawnPlaced)[])
}

export const Attack = new Archetype(
    'Attack',
    true,
    1,
    selected_tree => {
        const selected_pawn = (selected_tree as SelectedTreeLeaf).items[0].as_pawn()
        return new ModifierKillPawn(selected_pawn.id)
    },
    callback => {
        return new OnePawnSelector(
            callback,
            filters([
                filter_pawns_owned_by_enemy_of_session_player_if_current,
                filter_as_pawns((session, pawn) => {
                    if (pawn.state != 'Placed') return false
                    const modifier = new ModifierKillPawn(pawn.id)
                    return proximity_enemy_pawns(session.game, pawn).length > 0
                        && modifier.is_allowed(session.game) 
                        && modifier.is_playable(session.game, session.player)
                })
            ])
        )
    },
    true
)

export const StackAttack = new ArchetypeStack([
    Attack, Attack, Attack, Attack
], 0)
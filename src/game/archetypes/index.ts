import { Archetype, ArchetypeStack } from "../cards";
import { ModifierMovePawn } from "../gameplay_modifiers";
import type { PawnPlaced } from "../model";
import { type SelectedTreeRoot, type SelectedTreeLeaf, select_one_currently_playable_pawn_if, OneTileSelector, filter_as_tiles, ChainedSelector } from "../selectors";

function mod(n, m) {
    return ((n % m) + m) % m;
}

const SmallRivers = displacement_archetype(
    "Small Rivers", 1, 
    [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: 0 }
    ]
)

export const StackSmallRivers = new ArchetypeStack([
    SmallRivers,
    SmallRivers,
    SmallRivers,
    SmallRivers
], 0)

const Knight = displacement_archetype(
    "Knight", 2, 
    [
        { x: 1, y: 2 },
        { x: 1, y: -2 },
        { x: -1, y: 2 },
        { x: -1, y: -2 },
        { x: 2, y: 1 },
        { x: -2, y: 1 },
        { x: 2, y: -1 },
        { x: -2, y: -1 },
    ]
)

export const StackKnight = new ArchetypeStack([
    Knight,
    Knight,
], 0)

export function displacement_archetype(name: string, cost: number, pattern: { x: number, y: number; }[]): Archetype {
    return {
        name,
        recyclable: true,
        action_points_cost: cost,
        modifier_factory: selected_tree => {
            const selected_root = selected_tree as SelectedTreeRoot
            const selected_pawn = (selected_root.children[0] as SelectedTreeLeaf).items[0].as_pawn()
            const selected_tile = (selected_root.children[1] as SelectedTreeLeaf).items[0].as_tile()
    
            return new ModifierMovePawn(selected_pawn.id, {
                x: selected_tile.x,
                y: selected_tile.y
            })
        },
        selector_factory: callback => {
            let selected_pawn_id: number

            const pawn_selector = select_one_currently_playable_pawn_if(
                (session, pawn) => {
                    return pawn.state == 'Placed' && pattern.some(shift => {
                        const modifier = new ModifierMovePawn(pawn.id, {
                            x: mod(pawn.x + shift.x, session.game.rules.width),
                            y: mod(pawn.y + shift.y, session.game.rules.height)
                        })
                        return modifier.is_allowed(session.game) && modifier.is_playable(session.game, session.player)
                    })
                },
                pawn => selected_pawn_id = pawn.id
            )

            const tile_selector = new OneTileSelector(
                _ => {},
                filter_as_tiles(
                    (session, tile) => pattern.some(shift => {
                        const pawn = session.game.pawns[selected_pawn_id] as PawnPlaced
                        return mod(pawn.x + shift.x, session.game.rules.width) == tile.x
                            && mod(pawn.y + shift.y, session.game.rules.height) == tile.y
                            && tile.state == 'Empty'
                    })
                )
            )
            
            return new ChainedSelector([pawn_selector, tile_selector], callback)
        }
    }
}
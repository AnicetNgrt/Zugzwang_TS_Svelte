import { ModifierMovePawn } from "./gameplay_modifiers";
import type { PawnPlaced, Player } from "./model";
import type { Modifier } from "./modifiers";
import { ChainedSelector, filter_as_tiles, OneTileSelector, type SelectedTree, type SelectedTreeLeaf, type SelectedTreeRoot, type Selector, select_one_currently_playable_pawn_if } from "./selectors";

export class CardStack {
    constructor(
        public readonly stack: Array<number>,
        public readonly weight: number
    ) {}
}

export class ArchetypeStack {
    constructor(
        public readonly archetypes: Array<Archetype>,
        public readonly weight: number
    ) {}
}

export class Card  {
    protected selector: Selector
    protected selected: SelectedTree

    constructor(
        public readonly id: number,
        public readonly archetype: Archetype,
        public used: boolean,
        public owner: Player
    ) {
        this.rebuild_selector(() => {})
    }

    rebuild_selector(callback: () => void): Selector {
        this.selector = this.archetype.selector_factory(callback)
        this.selector.on_finished(selected_tree => {
            this.selected = selected_tree
        }, true)
        this.selected = null
        return this.selector
    }

    can_build_modifier(): boolean {
        return this.selector.is_finished()
    }

    build_modifier(): Modifier {
        return this.archetype.modifier_factory(this.selected)
    }
}

export class Archetype {
    constructor(
        public readonly name: string,
        public readonly recyclable: boolean,
        public readonly action_points_cost: number,
        public readonly modifier_factory: (selected_tree: SelectedTree) => Modifier,
        public readonly selector_factory: (callback: () => void) => Selector
    ) {}
}

export class ArchetypeDisplacement extends Archetype {
    constructor(
        public readonly name: string,
        public readonly action_points_cost: number,
        public readonly pattern: { x: number, y: number }[]
    ) {
        super(
            name,
            true,
            action_points_cost,
            selected_tree => {
                const selected_root = selected_tree as SelectedTreeRoot
                const selected_pawn = (selected_root.children[0] as SelectedTreeLeaf).items[0].as_pawn()
                const selected_tile = (selected_root.children[1] as SelectedTreeLeaf).items[0].as_tile()
        
                return new ModifierMovePawn(selected_pawn.id, {
                    x: selected_tile.x,
                    y: selected_tile.y
                })
            },
            callback => {
                let selected_pawn_id: number
                
                const mod = (n, m) => ((n % m) + m) % m

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
        )
    }
}
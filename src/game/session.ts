import { is_current_player } from "./model"
import type { Game, Pawn, Player, Tile } from "./model"
import { ModifierPlacePawn } from "./modifiers"
import type { Modifier } from "./modifiers"
import { ModifierEndTurn } from "./modifiers"

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

type SelectableObject = null | Tile | Pawn
type SelectableType = 'null' | 'Tile' | 'Pawn'

type SelectedTree = SelectedTreeLeaf | SelectedTreeRoot

interface SelectedTreeLeaf { type: 'Leaf', items: Selectable[] }
interface SelectedTreeRoot { type: 'Root', children: SelectedTree[] }

export class Selectable {
    constructor(
        protected object: SelectableObject,
        protected type: SelectableType
    ) {}

    get_type(): SelectableType {
        return this.type
    }

    as_tile(): Tile {
        return this.type == 'Tile' ? this.object as Tile : null
    }

    as_pawn(): Pawn {
        return this.type == 'Pawn' ? this.object as Pawn : null
    }

    equals(selectable: Selectable): boolean {
        if (selectable.type != this.type) return false
        if (this.type == 'Pawn') return (this.object as Pawn).id == (selectable.object as Pawn).id
        if (this.type == 'Tile') {
            const { x: xA, y: yA } = this.object as Tile
            const { x: xB, y: yB } = selectable.object as Tile
            return xA == xB && yA == yB
        }
    }
}

export interface Selector {
    on_finished(callback: (selected: SelectedTree) => void): void
    get_callback(): (selected: SelectedTree) => void
    is_finished(): boolean
    is_empty(): boolean
    is_candidate: SelectableFilter
    is_selected(session: GameSession, el: Selectable): boolean
    toggle(session: GameSession, el: Selectable): boolean
}

export type SelectableFilter = (session: GameSession, el: Selectable) => boolean

export class InlineSelector implements Selector {
    constructor(
        public on_finished: (callback: (selected: SelectedTree) => void) => void,
        public get_callback: () => (selected: SelectedTree) => void,
        public is_finished: () => boolean,
        public is_empty: () => boolean,
        public is_candidate: (session: GameSession, el: Selectable) => boolean,
        public is_selected: (session: GameSession, el: Selectable) => boolean,
        public toggle: (session: GameSession, el: Selectable) => boolean
    ) {}
}

export class AmountSelector implements Selector {
    protected selected: Selectable[]

    constructor(
        protected max: number,
        protected callback: (selected: SelectedTree) => void = _ => {},
        public is_candidate: SelectableFilter
    ) {
        this.selected = []
    }

    is_empty(): boolean {
        return this.selected.length == 0
    }

    on_finished(callback: (selected: SelectedTree) => void) {
        this.callback = callback
    }

    get_callback(): (selected: SelectedTree) => void {
        return this.callback
    }

    is_finished(): boolean {
        return this.selected.length >= this.max
    }

    is_selected(_session: GameSession, el: Selectable): boolean {
        return this.selected.some(selected_el => selected_el.equals(el))
    }

    toggle(session: GameSession, el: Selectable): boolean {
        if (this.is_selected(session, el)) {
            this.selected = this.selected
                .filter(selected_el => !selected_el.equals(el))
        } else {
            if (this.selected.length >= this.max) {
                this.selected.pop()
            }
            this.selected.push(el)
            if (this.is_finished()) this.callback({ type: "Leaf", items: this.selected })
            return true
        }
        return false
    }
}

export class DummySelector extends AmountSelector {
    constructor() {
        super(0, _ => {}, (_a, _b) => false)
    }

    is_finished(): boolean {
        return false
    }
}

export class ChainedSelector implements Selector {
    protected previous: Selector
    protected current: Selector
    protected current_id: number
    protected selected_tree: SelectedTreeRoot
    protected final_chain_initial_callback: (selected: SelectedTree) => void

    constructor(
        protected chain: Selector[],
        callback: (selected_tree: SelectedTree) => void
    ) {
        this.previous = null
        this.current = chain[0]
        this.current_id = 0
        this.selected_tree = {
            type: 'Root',
            children: chain.map(_ => ({
                type: 'Leaf',
                items: []
            }))
        }
        
        for (let i = 0; i < chain.length-1; i++) {
            const initial_callback = chain[i].get_callback()
            chain[i].on_finished(selected_tree => {
                initial_callback(selected_tree)
                this.previous = chain[i]
                this.current = chain[i+1]
                this.current_id = i+1
                this.selected_tree.children[i] = selected_tree
            
                chain[i].on_finished(selected_tree => {
                    initial_callback(selected_tree)
                    if (i == this.current_id) {
                        this.previous = chain[i]
                        this.current = chain[i+1]
                        this.current_id = i+1
                    }
                    this.selected_tree.children[i] = selected_tree
                })
            })
        }

        this.final_chain_initial_callback = this.chain[this.chain.length-1].get_callback()
        this.on_finished(callback)
    }

    is_empty(): boolean {
        return this.current_id == 0 && this.current.is_empty()
    }

    is_candidate(session: GameSession, el: Selectable): boolean {
        if (
            this.previous 
            && this.current.is_empty() 
            && !this.current.is_candidate(session, el)
        ) {
            return this.previous.is_candidate(session, el)
        }
        return this.current.is_candidate(session, el)
    }

    on_finished(callback: (selected_tree: SelectedTree) => void) {
        this.chain[this.chain.length-1].on_finished(selected_tree => {
            this.final_chain_initial_callback(selected_tree)
            this.selected_tree.children[this.chain.length-1] = selected_tree
            callback(this.selected_tree)
        })
    }

    get_callback(): (selected: SelectedTree) => void {
        return this.chain[this.chain.length-1].get_callback()
    }

    is_finished(): boolean {
        return this.current == this.chain[this.chain.length-1]
            && this.current.is_finished()
    }

    is_selected(session: GameSession, el: Selectable): boolean {
        if (!this.current.is_selected(session, el) && this.current.is_candidate(session, el)) return false
        return this.chain.some(c => c.is_selected(session, el))
    }

    toggle(session: GameSession, el: Selectable): boolean {
        if (
            this.previous
            && this.current.is_empty()
            && !this.current.is_candidate(session, el)
            && this.previous.is_candidate(session, el)
        ) {
            const result = this.previous.toggle(session, el)
            if (!result && this.previous.is_empty() && this.current_id > 0) {
                this.current = this.previous
                this.previous = this.current_id >= 2 ? this.chain[this.current_id-2] : null
                this.current_id -= 1
            }
            return result
        }

        return this.current.toggle(session, el)
    }
}

export function type_filter(type: SelectableType): SelectableFilter {
    return (_session: GameSession, el: Selectable): boolean => {
        return el.get_type() == type
    }
}

export function middlewares_filter(filters: SelectableFilter[]) {
    return (session: GameSession, el: Selectable): boolean => {
        return !filters.some(f => f(session, el) == false)
    }
}

export function place_pawn(callback: (modifier: ModifierPlacePawn) => void): Selector {
    let selected_pawn_id: number
    let selected_tile: Tile
    
    return new ChainedSelector(
        [
            new AmountSelector(
                1,
                (selected_tree) => {
                    if (selected_tree.type != 'Leaf') return
                    selected_pawn_id = selected_tree.items[0].as_pawn().id
                },
                middlewares_filter([
                    type_filter('Pawn'),
                    (session, el) => {
                        const pawn = el.as_pawn()
                        if (pawn.owner == 'Gaia') return false
                        return is_current_player(session.game, pawn.owner)
                            && session.player == pawn.owner
                            && pawn.state == 'Staging'
                    }
                ])
            ),
            new AmountSelector(
                1,
                (selected_tree) => {
                    if (selected_tree.type != 'Leaf') return
                    selected_tile = selected_tree.items[0].as_tile()
                },
                middlewares_filter([
                    type_filter('Tile'),
                    (session, el) => {
                        const tile = el.as_tile()
                        const modifier = new ModifierPlacePawn(selected_pawn_id, { x: tile.x, y: tile.y })
                        return modifier.is_allowed(session.game) && modifier.is_playable(session.game, session.player)
                    }
                ])
            ),
        ],
        (_) => {
            const modifier = new ModifierPlacePawn(
                selected_pawn_id, 
                { x: selected_tile.x, y: selected_tile.y }
            )
            callback(modifier)
        }
    )
}
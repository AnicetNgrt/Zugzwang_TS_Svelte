import type { Tile, Pawn } from "./model"
import type { GameSession } from "./session"

type SelectableObject = null | Tile | Pawn
type SelectableType = 'null' | 'Tile' | 'Pawn'

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

// export class SelectableTile extends Selectable {
//     constructor(
//         object: Tile
//     ) {
//         super(object, 'Tile')
//     }
// }

// export class SelectablePawn extends Selectable {
//     constructor(
//         object: Pawn
//     ) {
//         super(object, 'Pawn')
//     }
// }

export interface Selector {
    on_finished(callback: (selected: [Selectable[]]) => void)
    is_finished(): boolean
    is_empty(): boolean
    is_candidate(session: GameSession, el: Selectable): boolean
    is_selected(el: Selectable): boolean
    toggle(session: GameSession, el: Selectable): boolean
}

export class SimpleSelector implements Selector {
    protected selected: Selectable[]

    constructor(
        protected type: SelectableType,
        protected max: number,
        protected is_candidate_middleware: (session: GameSession, el: Selectable) => boolean,
        protected callback: (selected: [Selectable[]]) => void = _ => {}
    ) {
        this.selected = []
    }

    is_candidate(session: GameSession, el: Selectable): boolean {
        return el.get_type() == this.type && this.is_candidate_middleware(session, el)
    }

    is_empty(): boolean {
        return this.selected.length == 0
    }

    on_finished(callback: (selected: [Selectable[]]) => void) {
        this.callback = callback
    }

    is_finished(): boolean {
        return this.selected.length >= this.max
    }

    is_selected(el: Selectable): boolean {
        return this.selected.some(selected_el => selected_el.equals(el))
    }

    toggle(_session: GameSession, el: Selectable): boolean {
        if (this.is_selected(el)) {
            this.selected = this.selected
                .filter(selected_el => selected_el.equals(el))
        } else {
            if (this.selected.length >= this.max) {
                this.selected.pop()
            }
            this.selected.push(el)
            if (this.is_finished()) this.callback([this.selected])
            return true
        }
        return false
    }
}

export class DummySelector implements Selector {
    on_finished(_callback: (selected: [null[]]) => void) {}

    is_finished(): boolean {
        return false
    }

    is_empty(): boolean {
        return true
    }

    is_candidate(_session: GameSession, _el: null): boolean {
        return false
    }

    is_selected(_el: null): boolean {
        return false
    }

    toggle(_session: GameSession, _el: null): boolean {
        return false
    }
}

// export class ChainedSelector implements Selector {
//     protected previous: Selector
//     protected current: Selector
//     protected current_id: number
//     protected all_selected: Array<SelectedItems>

//     constructor(
//         protected chain: [Selector]
//     ) {
//         this.previous = null
//         this.current = chain[0]
//         this.current_id = 0
//         this.all_selected = []
//         for (let i = 0; i < chain.length-1; i++) {
//             chain[i].on_finished(selected => {
//                 this.previous = chain[i]
//                 this.current = chain[i+1]
//                 this.current_id = i+1
//                 this.all_selected.push(selected[0])
                
//                 chain[i].on_finished(selected => {
//                     this.all_selected[i] = selected[0]
//                 })
//             })
//         }
//     }

//     is_empty(): boolean {
//         return !this.previous && this.current.is_empty()
//     }

//     is_tile_candidate(session: GameSession, tile: Tile): boolean {
//         if (
//             this.previous 
//             && this.current.is_empty() 
//             && !this.current.is_tile_candidate(session, tile)
//         ) {
//             return this.previous.is_tile_candidate(session, tile)
//         }
//         return this.current.is_tile_candidate(session, tile)
//     }

//     is_pawn_candidate(session: GameSession, pawn: Pawn): boolean {
//         if (
//             this.previous
//             && this.current.is_empty()
//             && !this.current.is_pawn_candidate(session, pawn)
//         ) {
//             return this.previous.is_pawn_candidate(session, pawn)
//         }
//         return this.current.is_pawn_candidate(session, pawn)
//     }

//     on_finished(callback: (selected: [SelectedItems]) => void) {
//         this.chain[this.chain.length-1].on_finished(selected => {
//             this.all_selected.push(selected[0])
//             callback(this.all_selected as [SelectedItems])
//         })
//     }

//     is_finished(): boolean {
//         return this.current == this.chain[this.chain.length-1]
//             && this.current.is_finished()
//     }

//     is_tile_selected(tile: Tile): boolean {
//         return this.chain.some(c => c.is_tile_selected(tile))
//     }

//     is_pawn_selected(pawn: Pawn): boolean {
//         return this.chain.some(c => c.is_pawn_selected(pawn))
//     }

//     toggle_tile(session: GameSession, tile: Tile): boolean {
//         if (
//             this.previous
//             && this.current.is_empty()
//             && this.current.is_tile_candidate(session, tile)
//         ) {
//             const result = this.previous.toggle_tile(session, tile)
//             if (!result && this.previous.is_empty() && this.current_id > 0) {
//                 this.previous = this.current_id >= 2 ? this.chain[this.current_id-2] : null
//                 this.current = this.previous
//                 this.current_id -= 1
//             }
//             return result
//         }

//         return this.current.toggle_tile(session, tile)
//     }

//     toggle_pawn(session: GameSession, pawn: Pawn): boolean {
//         if (
//             this.previous
//             && this.current.is_empty()
//             && this.current.is_pawn_candidate(session, pawn)
//         ) {
//             const result = this.previous.toggle_pawn(session, pawn)
//             if (!result && this.previous.is_empty() && this.current_id > 0) {
//                 this.previous = this.current_id >= 2 ? this.chain[this.current_id-2] : null
//                 this.current = this.previous
//                 this.current_id -= 1
//             }
//             return result
//         }

//         return this.current.toggle_pawn(session, pawn)
//     }
// }
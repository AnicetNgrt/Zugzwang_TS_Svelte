import type { Tile, Pawn } from "./model"
import type { GameSession } from "./session"

interface SelectedItems {
    tiles_positions: Array<{ x: number, y: number }>
    pawns_ids: Array<number>
}

export interface Selector<T, I> {
    is_of_type(type: string): boolean
    on_finished(callback: (selected: [I[]]) => void)
    is_finished(): boolean
    is_empty(): boolean
    is_candidate(session: GameSession, el: T): boolean
    is_selected(el: T): boolean
    toggle(session: GameSession, el: T): boolean
}

export class SimpleSelector<T, I> implements Selector<T, I> {
    protected selected: I[]

    constructor(
        public type: string,
        protected max: number,
        protected e_to_i: (el: T) => I,
        public is_candidate: (session: GameSession, el: T) => boolean,
        protected callback: (selected: [I[]]) => void = _ => {}
    ) {
        this.selected = []
    }

    is_of_type(type: string): boolean {
        return this.type === type
    }

    is_empty(): boolean {
        return this.selected.length == 0
    }

    on_finished(callback: (selected: [I[]]) => void) {
        this.callback = callback
    }

    is_finished(): boolean {
        return this.selected.length >= this.max
    }

    is_selected(el: T): boolean {
        return this.selected.some(id => id == this.e_to_i(el))
    }

    toggle(_session: GameSession, el: T): boolean {
        if (this.is_selected(el)) {
            this.selected = this.selected
                .filter(id => id != this.e_to_i(el))
        } else {
            if (this.selected.length >= this.max) {
                this.selected.pop()
            }
            this.selected.push(this.e_to_i(el))
            if (this.is_finished()) this.callback([this.selected])
            return true
        }
        return false
    }
}

export class DummySelector<T, I> implements Selector<T, I> {
    is_of_type(_type: string): boolean {
        return false
    }

    on_finished(_callback: (selected: [I[]]) => void) {}

    is_finished(): boolean {
        return false
    }

    is_empty(): boolean {
        return true
    }

    is_candidate(_session: GameSession, _el: T): boolean {
        return false
    }

    is_selected(_el: T): boolean {
        return false
    }

    toggle(_session: GameSession, _el: T): boolean {
        return false
    }
}

export class DoubleSelector<A, IdxA, B, IdxB, T = A | B, I = IdxA | IdxB> implements Selector<T, I> {
    constructor(
        protected first: Selector<A, IdxA>,
        protected second: Selector<B, IdxB>
    ) {}

    is_of_type(type: string): boolean {
        return this.first.is_of_type(type) || this.second.is_of_type(type)
    }
    
    on_finished(callback: (selected: [I[]]) => void) {
        throw new Error("Method not implemented.")
    }
    is_finished(): boolean {
        throw new Error("Method not implemented.")
    }
    is_empty(): boolean {
        throw new Error("Method not implemented.")
    }
    is_candidate(session: GameSession, el: T): boolean {
        throw new Error("Method not implemented.")
    }
    is_selected(el: T): boolean {
        throw new Error("Method not implemented.")
    }
    toggle(session: GameSession, el: T): boolean {
        throw new Error("Method not implemented.")
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
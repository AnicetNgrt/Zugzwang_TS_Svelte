import type { Writable } from "svelte/store"

export interface GameSession {
    done: Array<Modifier>
    game: Game
}

export function apply(session: GameSession, modifier: Modifier): GameSession {
    if (modifier.is_allowed(session.game)) {
        modifier.apply(session.game)
        return {
            done: [...session.done, modifier],
            game: session.game
        }
    }
    return session
}

export interface Game {
    rules: Rules
    board: Board
    pawns: Array<Pawn>
}

export interface Rules {
    max_pawn_per_player: number
    width: number
    height: number
}

export type Board = Array<Array<Tile>>

export type Tile = TileBase &
    (
        | TileEmpty
        | TileOccupied
    )

export interface TileBase { x: number, y: number }
export interface TileEmpty { state: 'Empty'; }
export interface TileOccupied { state: 'Occupied'; pawn_id: number }

export type Pawn = PawnBase &
    (
        | PawnDead
        | PawnStaging
        | PawnPlaced
    )

export interface PawnBase { id: number, owner: Entity }
export interface PawnDead { state: 'Dead' }
export interface PawnStaging { state: 'Staging' }
export interface PawnPlaced { state: 'Placed'; x: number, y: number }

export type Entity = 'Player1' | 'Player2' | 'Gaia'

export interface Modifier {
    apply(game: Game);
    rollback(game: Game);
    is_allowed(game: Game): boolean;
}

export function new_game(rules: Rules): Game {
    return {
        rules,
        board: new_board(rules.width, rules.height),
        pawns: new Array()
    }
}

export class ModifierAddPawn implements Modifier {
    constructor(
        protected owner: Entity
    ) {}

    is_allowed(game: Game): boolean {
        return game.pawns.filter(p => p.owner == this.owner).length < game.rules.max_pawn_per_player
    }

    apply(game: Game) {
        game.pawns.push({ id: game.pawns.length, owner: this.owner, state: 'Staging' })
    }

    rollback(game: Game){
        game.pawns.pop()
    }
}

export class ModifierPlacePawn implements Modifier {
    constructor(
        protected pawn_id: number,
        protected position: { x: number, y: number }
    ) {}

    is_allowed(game: Game): boolean {
        if (game.board[this.position.y][this.position.x].state != 'Empty') return false
        if (game.pawns[this.pawn_id].state != 'Staging') return false
        return true
    }

    apply(game: Game) {
        let new_pawn: PawnBase & PawnPlaced = { 
            state: 'Placed', 
            id: this.pawn_id,
            owner: game.pawns[this.pawn_id].owner,
            ...this.position
        }
        game.pawns[this.pawn_id] = new_pawn

        let destination: TileBase & TileOccupied = {
            ...this.position,
            state: 'Occupied',
            pawn_id: this.pawn_id
        }
        game.board[this.position.y][this.position.x] = destination
    }

    rollback(game: Game){
        let new_pawn: PawnBase & PawnStaging = { 
            state: 'Staging',
            id: this.pawn_id,
            owner: game.pawns[this.pawn_id].owner
        }
        game.pawns[this.pawn_id] = new_pawn

        let destination: TileBase & TileEmpty = {
            ...this.position,
            state: 'Empty'
        }
        game.board[this.position.y][this.position.x] = destination
    }
}

export class ModifierMovePawn implements Modifier {
    protected previous_state: PawnPlaced

    constructor(
        protected pawn_id: number,
        protected position: { x: number, y: number }
    ) {}

    is_allowed(game: Game): boolean {
        if (game.board[this.position.y][this.position.x].state != 'Empty') return false
        if (game.pawns[this.pawn_id].state != 'Placed') return false
        return true
    }

    apply(game: Game) {
        this.previous_state = { ...game.pawns[this.pawn_id] as PawnPlaced }

        let new_pawn: PawnBase & PawnPlaced = { 
            state: 'Placed', 
            id: this.pawn_id,
            owner: game.pawns[this.pawn_id].owner,
            ...this.position
        }
        game.pawns[this.pawn_id] = new_pawn

        let destination: TileBase & TileOccupied = {
            ...this.position,
            state: 'Occupied',
            pawn_id: this.pawn_id
        }
        game.board[this.position.y][this.position.x] = destination

        let origin: TileBase & TileEmpty = {
            x: this.previous_state.x,
            y: this.previous_state.y,
            state: 'Empty'
        }
        game.board[this.previous_state.y][this.previous_state.x] = origin
    }

    rollback(game: Game){
        const modifier = new ModifierMovePawn(this.pawn_id, {
            x: this.previous_state.x,
            y: this.previous_state.y
        })

        modifier.apply(game)
    }
}

function new_board(width: number, height: number): Board {
    const tiles: Array<Array<Tile>> = range(height).map(
        (_, y) => range(width).map(
            (_, x) => ({ x, y, state: 'Empty' })))

    return tiles
}

function range(n: number): number[] {
    return [...new Array(n).keys()]
}
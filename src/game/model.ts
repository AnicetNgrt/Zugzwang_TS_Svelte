export interface Game {
    rules: Rules
    board: Board
    pawns: Array<Pawn>
    turn: number
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

export type Player = 'Player1' | 'Player2'

export type Entity = Player | 'Gaia'

export function is_current_player(game: Game, player: Player): boolean {
    if (game.turn % 2 == 0 && player != 'Player1') return false
    if (game.turn % 2 == 1 && player != 'Player2') return false
    return true
}
import type { Card, CardStack } from "./cards"

export interface Game {
    rules: Rules
    board: Board
    pawns: Array<Pawn>
    turn: number
    action_points: Map<Player, number>
    cards: Map<number, Card>
    card_stacks: Map<Player, Array<CardStack>>
}

export interface Rules {
    readonly max_pawn_per_player: number
    readonly max_weight: number
    readonly max_ap: number
    readonly width: number
    readonly height: number
}

export type Board = Array<Array<Tile>>

export type Tile = TileBase &
    (
        | TileEmpty
        | TileOccupied
    )

export interface TileBase { readonly x: number, readonly y: number }
export interface TileEmpty { state: 'Empty'; }
export interface TileOccupied { state: 'Occupied'; pawn_id: number }

export type Pawn = PawnBase &
    (
        | PawnDead
        | PawnStaging
        | PawnPlaced
    )

export type PawnState = "Dead" | "Staging" | "Placed"

export interface PawnBase { readonly id: number, owner: Player }
export interface PawnDead { state: 'Dead' }
export interface PawnStaging { state: 'Staging' }
export interface PawnPlaced { state: 'Placed'; x: number, y: number }

export type Player = 'Player1' | 'Player2'

export function is_current_player(game: Game, player: Player): boolean {
    if (game.turn % 2 == 1 && player != 'Player1') return false
    if (game.turn % 2 == 0 && player != 'Player2') return false
    return true
}
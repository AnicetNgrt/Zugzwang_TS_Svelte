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

function new_board(width: number, height: number): Board {
    const tiles: Array<Array<Tile>> = range(height).map(
        (_, y) => range(width).map(
            (_, x) => ({ x, y, state: 'Empty' })))

    return tiles
}

function range(n: number): number[] {
    return [...new Array(n).keys()]
}
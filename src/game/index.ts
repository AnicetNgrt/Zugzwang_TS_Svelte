import type { Board, Game, Rules, Tile } from "./model"

export * from './model'
export * from './modifiers'
export * from './session'
export * from './selectors'

export function new_game(rules: Rules): Game {
    return {
        rules,
        board: new_board(rules.width, rules.height),
        pawns: new Array(),
        turn: 0
    }
}

function new_board(width: number, height: number): Board {
    const range = n => [...new Array(n).keys()]

    const tiles: Array<Array<Tile>> = range(height).map(
        (_, y) => range(width).map(
            (_, x) => ({ x, y, state: 'Empty' })))

    return tiles
}
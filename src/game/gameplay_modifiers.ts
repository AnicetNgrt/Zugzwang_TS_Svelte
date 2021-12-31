import { type Archetype, Card, ArchetypeStack, CardStack } from "./cards"
import type { Player, Game, PawnBase, PawnPlaced, TileBase, TileOccupied, PawnStaging, TileEmpty } from "./model"
import type { Modifier } from "./modifiers"

export class ModifierEndTurn implements Modifier {
    protected action_points: Map<Player, number>
    protected recycled_cards_ids: Array<number>

    constructor() {
        this.action_points = new Map()
        this.recycled_cards_ids = []
    }

    apply(game: Game) {
        game.turn += 1

        if (game.turn > 1) {
            this.action_points.set('Player1', game.rules.max_ap)
            game.action_points.set('Player1', game.rules.max_ap)
        }
        if (game.turn > 2) {
            this.action_points.set('Player2', game.rules.max_ap)
            game.action_points.set('Player2', game.rules.max_ap)
        }

        game.cards.forEach(card => {
            if (card.archetype.recyclable && card.used) {
                this.recycled_cards_ids.push(card.id)
                card.used = false
            }
        })
    }

    rollback(game: Game) {
        if (game.turn > 1) {
            game.action_points.set('Player1', this.action_points.get('Player1')) 
        }
        if (game.turn > 2) {
            game.action_points.set('Player2', this.action_points.get('Player2'))
        }

        game.turn -= 1

        this.recycled_cards_ids.forEach(id => {
            game.cards.get(id).used = true
        })
    }

    is_allowed(_game: Game): boolean {
        return true
    }

    is_playable(game: Game, player: Player): boolean {
        return ! game.pawns.some(p => p.owner == player && p.state == 'Staging')
    }
}

export class ModifierAddPawn implements Modifier {
    constructor(
        protected owner: Player
    ) { }

    is_playable(_game: Game, _player: Player): boolean {
        return true
    }

    is_allowed(game: Game): boolean {
        return game.pawns.filter(p => p.owner == this.owner).length < game.rules.max_pawn_per_player
    }

    apply(game: Game) {
        game.pawns.push({ id: game.pawns.length, owner: this.owner, state: 'Staging' })
    }

    rollback(game: Game) {
        game.pawns.pop()
    }
}

export class ModifierPlacePawn implements Modifier {
    constructor(
        protected pawn_id: number,
        protected position: { x: number, y: number }
    ) { }

    is_playable(game: Game, player: Player): boolean {
        if (game.pawns[this.pawn_id].owner != player) return false
        return true
    }

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

    rollback(game: Game) {
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
    ) { }

    is_playable(game: Game, player: Player): boolean {
        if (game.pawns[this.pawn_id].owner != player) return false
        return true
    }

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

    rollback(game: Game) {
        const modifier = new ModifierMovePawn(this.pawn_id, {
            x: this.previous_state.x,
            y: this.previous_state.y
        })

        modifier.apply(game)
    }
}

export class ModifierAddCardStack implements Modifier {
    protected modifiers: ModifierAddCard[]
    protected example_id: number

    constructor(
        protected archetype_stack: ArchetypeStack,
        protected owner: Player
    ) {
        this.modifiers = []
    }

    apply(game: Game) {
        let card_stack: CardStack = {
            stack: [],
            weight: this.archetype_stack.weight
        }
        this.modifiers = this.archetype_stack.archetypes
            .map(archetype => new ModifierAddCard(archetype, this.owner))
        this.modifiers.forEach(modifier => {
            modifier.apply(game)
            this.example_id = modifier.get_card_id()
            card_stack.stack.push(this.example_id)
        })
        game.card_stacks.set(this.owner, [...game.card_stacks.get(this.owner), card_stack])
    }

    rollback(game: Game) {
        this.modifiers.forEach(modifier => modifier.rollback(game))
        this.modifiers = []
        
        const not_our_stack = (card_stack: CardStack) => 
            card_stack.stack.every(id => id != this.example_id)
        game.card_stacks.set(
            this.owner, 
            game.card_stacks.get(this.owner).filter(not_our_stack)
        )
    }

    is_allowed(game: Game): boolean {
        const weight = game.card_stacks
            .get(this.owner)
            .reduce((weight, card_stack) => weight+card_stack.weight, 0)
        
        return weight+this.archetype_stack.weight <= game.rules.max_weight
    }

    is_playable(game: Game, player: Player): boolean {
        return game.turn == 0 && player == this.owner
    }
}

export class ModifierAddCard implements Modifier {
    protected id: number

    constructor(
        protected archetype: Archetype,
        protected owner: Player
    ) {}

    apply(game: Game) {
        this.id = 0
        game.cards.forEach(card => {
            if (card.id >= this.id) this.id = card.id+1
        })
        game.cards.set(this.id, new Card(
            this.id,
            this.archetype,
            false,
            this.owner
        ))
    }

    rollback(game: Game) {
        game.cards.delete(this.id)
    }

    is_allowed(_game: Game): boolean {
        return true
    }
    
    is_playable(_game: Game, _player: Player): boolean {
        return true
    }

    get_card_id(): number {
        return this.id
    }
}

export class ModifierConsumeCard implements Modifier {
    protected card_modifier: Modifier

    constructor(
        protected card_id: number
    ) {}

    apply(game: Game) {
        let card = game.cards.get(this.card_id)
        card.used = true
        game.action_points.set(
            card.owner, 
            game.action_points.get(card.owner)-card.archetype.action_points_cost
        )
    }

    rollback(game: Game) {
        let card = game.cards.get(this.card_id)
        game.action_points.set(
            card.owner, 
            game.action_points.get(card.owner)+card.archetype.action_points_cost
        )
        card.used = false
    }

    is_allowed(game: Game): boolean {
        let card = game.cards.get(this.card_id)
        if (game.action_points.get(card.owner) < card.archetype.action_points_cost) return false
        if (card.used) return false
        return true
    }
    
    is_playable(game: Game, player: Player): boolean {
        let card = game.cards.get(this.card_id)
        return player == card.owner
    }
}

export class ModifierPlayCard extends ModifierConsumeCard {
    protected card_modifier: Modifier

    constructor(
        protected card_id: number
    ) {
        super(card_id)
    }

    apply(game: Game) {
        super.apply(game)
        let card = game.cards.get(this.card_id)
        this.card_modifier = card.build_modifier()
        this.card_modifier.apply(game)
    }

    rollback(game: Game) {
        super.rollback(game)
        this.card_modifier.rollback(game)
    }

    is_allowed(game: Game): boolean {
        let card = game.cards.get(this.card_id)
        if (!super.is_allowed(game)) return false
        return card.build_modifier().is_allowed(game)
    }
    
    is_playable(game: Game, player: Player): boolean {
        return super.is_playable(game, player)
    }
}
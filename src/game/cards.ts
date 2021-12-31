import { ModifierConsumeCard } from "./gameplay_modifiers";
import type { Game, Player } from "./model";
import type { Modifier } from "./modifiers";
import type { SelectedTree, Selector } from "./selectors";

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
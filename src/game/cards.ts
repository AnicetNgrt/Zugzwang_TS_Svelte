import SmallRivers from "./cards/SmallRivers";
import type { Player } from "./model";
import type { Modifier } from "./modifiers";
import type { SelectedTree, Selector } from "./selectors";

export interface Card {
    readonly id: number
    readonly archetype: Archetype
    used: boolean
    owner: Player
}

export class Archetype {
    constructor(
        public readonly name: string,
        public readonly recyclable: boolean,
        public readonly modifier_factory: (selected_tree: SelectedTree) => Modifier,
        public readonly selector: Selector
    ) {}
}

export const displacement_cards: Archetype[] = [
    SmallRivers
]
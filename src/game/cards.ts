import SmallRivers from "./cards/SmallRivers";
import type { Player } from "./model";
import type { Modifier } from "./modifiers";
import type { Selector } from "./session";

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
        public readonly modifier: Modifier,
        public readonly selector: Selector
    ) {}
}

export const displacement_cards: Archetype[] = [
    SmallRivers
]
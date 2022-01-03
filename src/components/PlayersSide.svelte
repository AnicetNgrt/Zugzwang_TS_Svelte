<script lang="ts">
    import { ArchetypeDisplacement, Card, CardStack, GameSession, is_current_player, Player, PlayerMetadata } from "@game";
    import { getContext, onMount } from "svelte";
    import { writable, Writable } from "svelte/store";
    import DisplacementCard from "@components/DisplacementCard.svelte";
import type { subscribe } from "svelte/internal";

    const session: Writable<GameSession> = getContext('mainGame')

    export let player: Player

    let player_metadata: PlayerMetadata
    let ap: number
    let is_playing: boolean
    let card_stacks: CardStack[] = []
    let mounted = false

    let toggled_card: Writable<Card> = writable(null)

    let fake_tiles: Array<Array<boolean>>
    set_fake_tiles([])

    function set_fake_tiles(pattern: Array<{ x: number, y: number }>) {
        fake_tiles = [...new Array(7).keys()].map(_ => [...new Array(7).keys()].map(_ => false))
        pattern.forEach(({x, y}) => fake_tiles[y+3][x+3] = true)
    }

    const on_session_update = (session: GameSession) => {
        player_metadata = session.players_metadata.get(player)
        ap = session.game.action_points.get(player)
        is_playing = is_current_player(session.game, player)
        card_stacks = session.game.card_stacks.get(player)
    }

    toggled_card.subscribe(toggled_card => {
        if (!toggled_card) return
        set_fake_tiles((toggled_card.archetype as ArchetypeDisplacement).pattern)
    })

    onMount(() => {
        session.subscribe(on_session_update)
        mounted = true
    })
</script>

{#if mounted}
<div class={"w-fit flex flex-col mt-2 px-3 py-2 pb-3 rounded-sm shadow-xl shadow-primary-800/10" + (player == 'Player1' ? " bg-white/30 items-end" : " bg-black/30 items-start") + " backdrop-blur-lg"}>
    <h1 class={"text-xl font-bold" + (player == 'Player1' ? " text-black/40" : " text-white/40")}>
        {player_metadata.name}
    </h1>
    <div class={"flex h-14 w-full mt-1 gap-2 bg-accent-800/40 rounded-sm justify-center items-center" + (player == 'Player1' ? " text-black/60" : " text-white/60") + (is_playing ? " opacity-100" : " opacity-0")}>
        <h1 class="text-4xl font-bold mr-4 text-accent-400/80">PLAYING</h1>
        <h1 class={"text-4xl font-light" + (ap > 0 ? " text-accent-300/90" : " text-accent-300/40")}>{ap}</h1>
        <p class={"text-lg leading-4 mb-1 w-min" + (ap > 0 ? " text-accent-400/80" : " text-accent-400/40") }>action points</p>
    </div>
    <div class="flex gap-1 w-full h-fit mt-2">
        {#each card_stacks as {stack}}
            <div class={"flex flex-col bg-primary-400/20 p-2 items-center w-1/2 h-fit gap-1 rounded-sm" + (player == 'Player1' ? "  border-white/10" : "  border-black/10")}>
                {#each stack as id, i}
                    <DisplacementCard {toggled_card} stack_index={i} {id}/>
                {/each}
            </div>
        {/each}
    </div>
    {#if $toggled_card}
    <div class="flex flex-col mt-4 pt-0.5 bg-accent-800/40 text-accent-400/80 rounded-sm w-full">
        <div class="flex gap-2 items-center">
            <div class="flex w-8 h-8 justify-center items-center">
                <h1 class="text-xl font-bold">
                    {$toggled_card.archetype.action_points_cost}
                </h1>
            </div>
            <h1 class="text-xl font-bold">
                {$toggled_card.archetype.name}
            </h1>
        </div>
        <div class={"flex items-center justify-center w-full rounded-b-sm p-2 flex-col self-center bg-gradient-to-tr from-primary-200/50 to-primary-400/50"}>
            {#each fake_tiles as line, y}
            <div class="flex">
                {#each line as in_pattern, x}
                    <div class={"w-8 h-8 m-0.5 flex justify-center items-center" + (in_pattern ? " bg-primary-300/40" : " ") + (x == 3 && y == 3 ? " rounded-full bg-accent-800/40" : " rounded-sm")}>
                        <div class="rounded-sm text-primary-900/50 text-md">
                            +
                        </div>
                    </div>
                {/each}
            </div>
            {/each}
        </div>
    </div>
    {/if}
</div>
{/if}
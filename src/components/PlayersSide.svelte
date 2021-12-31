<script lang="ts">
    import { CardStack, GameSession, is_current_player, Player, PlayerMetadata } from "@game";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import DisplacementCard from "@components/DisplacementCard.svelte";
import Panel from "./Panel.svelte";

    const session: Writable<GameSession> = getContext('mainGame')

    export let player: Player

    let player_metadata: PlayerMetadata
    let ap: number
    let is_playing: boolean
    let card_stacks: CardStack[] = []
    let mounted = false

    const on_session_update = (session: GameSession) => {
        player_metadata = session.players_metadata.get(player)
        ap = session.game.action_points.get(player)
        is_playing = is_current_player(session.game, player)
        card_stacks = session.game.card_stacks.get(player)
    }

    onMount(() => {
        session.subscribe(on_session_update)
        mounted = true
    })
</script>

{#if mounted}
<div class={"flex flex-col mt-2 px-4 py-3 pb-6 rounded-sm shadow-xl shadow-primary-800/10" + (player == 'Player1' ? " bg-white/20 items-end" : " bg-black/20 items-start") + " backdrop-blur-lg"}>
    <h1 class={"text-xl font-bold" + (player == 'Player1' ? " text-black/40" : " text-white/40")}>
        {player_metadata.name}
    </h1>
    {#if is_playing}
    <div class={"flex h-14 w-full mt-2 gap-2 bg-accent-800/40 rounded-sm justify-center items-center" + (player == 'Player1' ? " text-black/60" : " text-white/60")}>
        <h1 class="text-4xl font-bold mr-4 text-accent-400/80">PLAYING</h1>
        <h1 class={"text-4xl font-light" + (ap > 0 ? " text-accent-300/90" : " text-accent-300/40")}>{ap}</h1>
        <p class={"text-lg leading-4 mb-1 w-min" + (ap > 0 ? " text-accent-400/80" : " text-accent-400/40") }>action points</p>
    </div>
    {:else}
    <div class="flex h-14 mt-2 gap-2"></div>
    {/if}
    <div class="flex gap-3 h-fit mt-4">
        {#each card_stacks as {stack}}
            <div class={"flex flex-col items-center w-36 h-fit gap-1 rounded-sm" + (player == 'Player1' ? " pl-2 border-l-2 border-white/10" : " pr-2 border-r-2 border-black/10")}>
                {#each stack as id}
                    <DisplacementCard {id}/>
                {/each}
            </div>
        {/each}
    </div>
</div>
{/if}
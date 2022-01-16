<script lang="ts">
    import type { GameSession, Card, Archetype } from "@game";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";

    export let id: number
    export let on_top: boolean
    export let toggled_card: Writable<Card>
    export let amount_usable: number
    export let amount_used: number

    const session: Writable<GameSession> = getContext('mainGame')
    
    let card: Card

    let toggled = false
    let archetype: Archetype

    const on_session_update = (session: GameSession) => {
        card = session.game.cards.get(id)
        archetype = card.archetype
    }

    onMount(() => {
        session.subscribe(on_session_update)
    })
</script>

{#if card}
<div 
class={"flex flex-col w-fit select-none shadow-primary-800/40 opacity-100 cursor-pointer hover:shadow-lg" + (card.used ? " opacity-40" : "") + (on_top ? "" : " opacity-60") + (toggled ? " opacity-100 z-10" : "")}
on:click={() => toggled_card.update(tc => {
    return tc ? (card.id == tc.id ? null : card) : card
})}
>
    <div class="flex">
        <div class={"w-7 flex flex-grow px-0.5 bg-accent-800/40 items-center justify-center rounded-tl-sm"}>
            <h2 class="text-accent-300/90 font-bold text-xs">
                {archetype.action_points_cost}
            </h2>
        </div>
        <div class={"relative flex items-center justify-center w-24 px-2 py-0.5 flex-col self-center bg-primary-300/30 rounded-tr-sm" + (toggled ? " rounded-l-sm" : "")}>
            <h1 class="text-xs">{archetype.name}</h1>
        </div>
    </div>
    <div class="flex justify-around bg-accent-300/40 gap-1.5 text-accent-900/70 text-xs font-medium px-1 py-0.5 rounded-b-sm">
        {#if amount_used > 0}
        <p class="">
            {amount_used} used
        </p>
        <p class="">
            |
        </p>
        {/if}
        <p class="">
            {#if amount_used <= 0} x {/if} {amount_usable} {#if amount_used > 0} left {/if}
        </p>
    </div>
</div>
{/if}
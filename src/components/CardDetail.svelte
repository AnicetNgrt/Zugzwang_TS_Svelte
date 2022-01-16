<script lang="ts">
    import { GameSession, Card, Selectable, Selector, update_selector } from "@game";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import ArchetypePreview from "@components/ArchetypePreview.svelte";

    const session: Writable<GameSession> = getContext('mainGame')
    
    export let card: Card
    export let on_closed: () => void

    const update_selectable = (session: GameSession, card: Card) => [
        session.selector.is_candidate(session, new Selectable(card, 'Card')),
        session.selector.is_selected(session, new Selectable(card, 'Card'))
    ]

    const on_session_update = (session: GameSession) => {
        [selectable, selected] = update_selectable(session, card)
    }

    function try_select() {
        $session = update_selector($session, (selector: Selector) => {
            selector.toggle($session, new Selectable(card, 'Card'))
            return selector
        })
    }

    onMount(() => {
        session.subscribe(on_session_update)
    })

    $: archetype = card.archetype
    $: [selectable, selected] = update_selectable($session, card)
</script>

<div class="flex flex-col gap-1 w-full">
    <div class="flex justify-between gap-1">
        <div 
            class="py-0.5 px-2 w-fit h-fit rounded-full cursor-pointer border-b-2 border-accent-700/30 bg-accent-800/40 text-accent-300/80 opacity-50 hover:opacity-100"
            on:click={on_closed}
        >
            <span class="text-xs">🡐</span> back
        </div>
        <div 
            class={"px-2 py-0.5 flex-grow text-center transition-all" + (selectable || selected ? " rounded-full border-b-2 font-medium cursor-pointer" : " rounded-sm text-primary-800/80 border-primary-900/0 cursor-default") + (selectable && !selected ? " bg-accent-400/60 text-accent-900/60 border-accent-900/30 hover:bg-accent-300/80 hover:text-accent-900 hover:border-accent-900/60 shadow-accent-900/50 hover:shadow-xl hover:scale-105" : "") + (selectable && selected ? " opacity-80 hover:opacity-100 bg-accent-300/80 text-accent-900 border-accent-900/60 shadow-accent-900/50" : "" ) + (!selectable && selected ? " opacity-50 cursor-not-allowed bg-accent-300/80 text-accent-900 border-accent-900/60 shadow-accent-900/50" : "" )}
            on:click={try_select}
        >
            {#if selected}
                Cancel
            {:else if selectable}
                Try this card
            {:else}
                You can't play this card
            {/if}
        </div>
    </div>
    {#if card}
    <ArchetypePreview {archetype}/>
    {/if}
</div>
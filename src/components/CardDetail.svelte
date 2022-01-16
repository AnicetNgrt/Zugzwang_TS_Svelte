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

<div class="flex flex-col gap-0 w-full">
    <div 
        class="py-0.5 px-2 w-fit rounded-t-sm text-sm cursor-pointer bg-accent-800/40 text-accent-300/80 opacity-50 hover:opacity-100"
        on:click={on_closed}
    >
        <span class="text-xs">🡐</span> back
    </div>
    {#if card}
    <ArchetypePreview {archetype}>
        {#if selectable}
            <div class="px-2 py-1.5 bg-accent-300/60 text-accent-900/60 cursor-pointer" on:click={try_select}>
                {#if selected}
                    Cancel
                {:else}
                    Play this card
                {/if}
            </div>
        {/if}
    </ArchetypePreview>
    {/if}
</div>
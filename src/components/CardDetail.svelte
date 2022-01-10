<script lang="ts">
    import { GameSession, Card, Selectable, Selector, update_selector } from "@game";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import ArchetypePreview from "@components/ArchetypePreview.svelte";

    const session: Writable<GameSession> = getContext('mainGame')
    
    export let card: Card

    let selectable = false
    let selected = false

    const on_session_update = (session: GameSession) => {
        selectable = session.selector.is_candidate(session, new Selectable(card, 'Card'))
        selected = session.selector.is_selected(session, new Selectable(card, 'Card'))
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
</script>

{#if card}
<ArchetypePreview archetype={card.archetype}></ArchetypePreview>
{/if}
<script lang="ts">
    import { GameSession, Card, Selectable, Selector, update_selector } from "@game";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import Panel from "@components/Panel.svelte";

    export let id: number

    const session: Writable<GameSession> = getContext('mainGame')
    
    let card: Card
    
    let mounted = false
    
    let selectable = false
    let selected = false

    const on_session_update = (session: GameSession) => {
        card = session.game.cards.get(id)

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
        mounted = true
    })

    let owner_color = {
        'Player1': 'from-zinc-400 to-zinc-50',
        'Player2': 'from-black to-slate-800'
    }
</script>

{#if card}
<div class={"px-2 py-1 w-full bg-primary-300/30 rounded-sm shadow-primary-800/20" + (card.used ? " opacity-40" : " opacity-100")}>
    <h1>{card.archetype.name}</h1>
</div>
{/if}
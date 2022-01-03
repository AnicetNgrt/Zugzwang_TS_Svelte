<script lang="ts">
    import { GameSession, Card, Selectable, Selector, update_selector, type ArchetypeDisplacement } from "@game";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";

    export let id: number
    export let stack_index: number
    export let toggled_card: Writable<Card>

    const session: Writable<GameSession> = getContext('mainGame')
    
    let card: Card
    
    let mounted = false
    
    let selectable = false
    let selected = false

    let toggled = false
    let archetype: ArchetypeDisplacement
    let fake_tiles: Array<Array<boolean>>
    set_fake_tiles([])

    function set_fake_tiles(pattern: Array<{ x: number, y: number }>) {
        fake_tiles = [...new Array(7).keys()].map(_ => [...new Array(7).keys()].map(_ => false))
        pattern.forEach(({x, y}) => fake_tiles[y+3][x+3] = true)
    }

    const on_session_update = (session: GameSession) => {
        card = session.game.cards.get(id)
        archetype = (card.archetype as ArchetypeDisplacement)
        set_fake_tiles(archetype.pattern)

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
<div 
class={"flex w-fit select-none shadow-primary-800/40 opacity-100 cursor-pointer hover:shadow-lg" + (card.used ? " opacity-40" : "") + (stack_index > 0 ? " opacity-60" : "") + (toggled ? " opacity-100 z-10" : "")}
on:click={() => toggled_card.update(tc => card == tc ? null : card)}
>
    <div class={"w-8 flex flex-grow px-0.5 bg-accent-800/40 items-center justify-center rounded-l-sm"}>
        <h2 class="text-accent-400/80 font-bold text-xl">{archetype.action_points_cost}</h2>
    </div>
    <div class={"relative flex items-center justify-center w-32 px-2 py-0.5 flex-col self-center bg-primary-300/30 rounded-r-sm" + (toggled ? " rounded-l-sm" : "")}>
        <h1 class="">{archetype.name}</h1>
        <div class={"my-1.5 flex items-center justify-center w-fit p-2 flex-col self-center bg-primary-400 rounded-sm" + (toggled ? " absolute -top-3 left-3 shadow-lg shadow-primary-800/40" : " hidden")}>
            {#each fake_tiles as line}
            <div class="flex">
                {#each line as in_pattern}
                    <div class={"w-4 h-4 flex rounded-full justify-center items-center" + (in_pattern ? " bg-primary-300/50" : " ")}>
                        <div class="rounded-sm text-primary-700/50 text-xs">
                            +
                        </div>
                    </div>
                {/each}
            </div>
            {/each}
        </div>
    </div>
</div>
{/if}
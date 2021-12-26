<script lang="ts">
    import { GameSession, Selectable, Selector, Tile, update_selector } from "@game";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";

    export let id: string
    export let position: { x: number, y: number } = null

    const session: Writable<GameSession> = getContext('mainGame')

    let tile: Tile

    let selectable = false
    let selected = false

    const on_session_update = (session: GameSession) => {
        if (!position) return

        tile = session.game.board[position.y][position.x]
        
        selectable = session.selector.is_candidate(session, new Selectable(tile, 'Tile'))
        selected = session.selector.is_selected(session, new Selectable(tile, 'Tile'))
    }

    function try_select() {
        if (!selectable) return false
        $session = update_selector($session, (selector: Selector) => {
            selector.toggle($session, new Selectable(tile, 'Tile'))
            return selector
        })
    }

    onMount(() => session.subscribe(on_session_update))
</script>

<div 
    {id} 
    class={"w-11 h-11 flex m-0.5 rounded-sm items-center justify-center select-none transition-all" + (selectable ? " cursor-pointer" : " cursor-default") + (selectable && !selected ? " bg-red-400/20 hover:bg-red-400/50" : "")} 
    on:click={try_select}
>
    <div class={"rounded-sm text-red-800/50 text-2xl"}>
        +
    </div>
</div>
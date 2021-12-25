<script lang="ts">
    import { GameSession, Tile, update_selector } from "@game";
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
        
        selectable = session.selector.is_of_type('Tile') ?
            session.selector.is_candidate(session, tile) : false
        selected = session.selector.is_of_type('Tile') ?
            session.selector.is_selected(tile) : false
    }

    function try_select() {
        $session = update_selector($session, selector => {
            selector.toggle($session, tile)
            return selector
        })
    }

    onMount(() => session.subscribe(on_session_update))
</script>

<div 
    {id} 
    class={"w-11 h-11 flex m-0.5 rounded-sm items-center justify-center select-none" + (selectable && !selected ? " bg-red-400/20" : "")} 
    on:click={try_select}
>
    <div class={"rounded-sm text-red-800/50 text-sm"}>
        •
    </div>
</div>
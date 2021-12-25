<script lang="ts">
    import type { GameSession, Tile } from "@game";
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
        
        update_selectable()
        let spos = session.selected_tile_position
        selected = spos.x == tile.x && spos.y == tile.y
    }

    function update_selectable() {
        selectable = $session.selected_tile_filter(tile)
    }

    function try_select() {
        let spos = $session.selected_tile_position
        if (selectable && !selected) {
            $session = { ...$session, selected_tile_position: { x: tile.x, y: tile.y } }
        } else if (spos.x == tile.x && spos.y == tile.y) {
            $session = { ...$session, selected_tile_position: { x: tile.x, y: tile.y } }
        }
    }

    onMount(() => session.subscribe(on_session_update))
</script>

<div 
    {id} 
    class={"w-12 h-12 flex m-0.5 rounded-sm items-center justify-center select-none" + (selectable && !selected ? " bg-red-400/20" : "")} 
    on:click={try_select}
>
    <div class={"rounded-sm text-red-800/50 text-sm"}>
        •
    </div>
</div>
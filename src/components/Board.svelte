<script lang="ts">
    import type { Board, GameSession } from "@game";
    import type { Writable } from "svelte/store";
    
    import Panel from "@components/Panel.svelte";
    import Tile from "@components/Tile.svelte";
    import { getContext } from "svelte";

    let id_prefix: string

    export { id_prefix as id }

    const session: Writable<GameSession> = getContext('mainGame')

    let board: Board

    session.subscribe(session => {
        board = session.game.board
    })
</script>

<Panel class="flex flex-col p-3">
{#each board as row}
    <div class="flex">
    {#each row as tile}
        <Tile id={id_prefix + "-" + tile.x + "-" + tile.y}/>
    {/each}
    </div>
{/each}
</Panel>
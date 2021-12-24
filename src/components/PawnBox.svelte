<script lang="ts">
    import type { Writable } from "svelte/store";

    import Panel from "@components/Panel.svelte";
    import Tile from "@components/Tile.svelte";
    import type { GameSession } from "@game";
    
    export let revert: boolean = false;

    let id_prefix: string
    export { id_prefix as id }
    export let ids: Array<number>
    export let min: number
</script>

<Panel class={"flex p-3 w-fit " + (revert ? "flex-row-reverse" : "")}>
    {#each [...ids, ...new Array(min - ids.length).map(_ => -1)] as id}
        <Tile id={id_prefix + "-" + id}/>
    {/each}
</Panel>
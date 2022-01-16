<script lang="ts">
    import { ArchetypeDisplacement, Archetype } from "@game";

    export let archetype: Archetype

    function compute_tiles(pattern: Array<{ x: number, y: number }>) {
        const tiles = [...new Array(7).keys()].map(_ => [...new Array(7).keys()].map(_ => false))
        pattern.forEach(({x, y}) => tiles[y+3][x+3] = true)
        return tiles
    }

    $: fake_tiles = archetype instanceof ArchetypeDisplacement ? compute_tiles(archetype.pattern) : null
</script>

<div class="flex flex-col pt-0.5 bg-accent-800/40 text-accent-400/80 rounded-sm rounded-tl-none w-full">
    <div class="flex gap-2 items-center">
        <div class="flex w-8 h-8 justify-center items-center">
            <h1 class="text-xl font-bold text-accent-300/90">
                {archetype.action_points_cost}
            </h1>
        </div>
        <h1 class="text-xl font-bold">
            {archetype.name}
        </h1>
    </div>
    {#if fake_tiles}
        <div class={"flex items-center justify-center w-full rounded-b-sm p-2 flex-col self-center bg-gradient-to-tr from-primary-200/50 to-primary-400/50"}>
            {#each fake_tiles as line, y}
            <div class="flex">
                {#each line as in_pattern, x}
                    <div class={"w-8 h-8 m-0.5 flex justify-center items-center" + (in_pattern ? " bg-primary-300/40" : " ") + (x == 3 && y == 3 ? " rounded-full bg-accent-800/40" : " rounded-sm")}>
                        <div class="rounded-sm text-primary-900/50 text-lg">
                            +
                        </div>
                    </div>
                {/each}
            </div>
            {/each}
        </div>
    {/if}
    <slot/>
</div>
<script lang="ts">
    import type { GameSession, Player } from "@game";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import Panel from "@components/Panel.svelte";

    const session: Writable<GameSession> = getContext('mainGame')
    
    export let player: Player
</script>

<div class={"flex flex-col w-96 mt-24 gap-1.5" + (player == 'Player1' ? " items-end" : "")}>
    <Panel class={"group h-8 w-fit aspect-square hover:aspect-auto hover:px-3 rounded-full flex justify-center items-center cursor-pointer" + (player == 'Player1' ? " bg-white/40 border-b-zinc-800/40 text-black/60" : " bg-black/40 border-b-black/50 text-white/60") }>
        <h1 class="text-md">
            <span class="group-hover:hidden block font-serif font-bold">
                A
            </span>
            <span class="hidden group-hover:block">
                show <span class="font-bold">Actions</span>
            </span>
        </h1>
    </Panel>
    <Panel class={"group h-8 w-fit aspect-square hover:aspect-auto hover:px-3 rounded-full flex justify-center items-center cursor-pointer" + (player == 'Player1' ? " bg-white/40 border-b-zinc-800/40 text-black/60" : " bg-black/40 border-b-black/50 text-white/60") }>
        <h1 class="text-md">
            <span class="group-hover:hidden block font-serif font-bold">
                M
            </span>
            <span class="hidden group-hover:block">
                show <span class="font-bold">Movements</span>
            </span>
        </h1>
    </Panel>
</div>
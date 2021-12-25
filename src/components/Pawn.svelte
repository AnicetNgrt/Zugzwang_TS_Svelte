<script lang="ts">
    import type { GameSession, Pawn } from "@game";
    import { tweened } from 'svelte/motion';
    import { quartInOut } from 'svelte/easing';
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";

    export let id: number

    const session: Writable<GameSession> = getContext('mainGame')

    let pawn: Pawn

    let div_pos = tweened({ x: window.innerWidth/2, y: -1000 }, { duration: 1000, easing: quartInOut })
    let destination_div_pos = { x: window.innerWidth/2, y: -1000 }

    let tile_id = ''

    onMount(() => {
        session.subscribe(session => {
            pawn = session.game.pawns[id]

            if (pawn.state == 'Placed') {
                tile_id = "board-"+pawn.x+"-"+pawn.y
            } else if (pawn.state == 'Staging') {
                tile_id = pawn.owner+"-pb-"+pawn.id
            }

            destination_div_pos = {
                x: document.getElementById(tile_id).getBoundingClientRect().x,
                y: document.getElementById(tile_id).getBoundingClientRect().y
            }
            div_pos.set({ ...destination_div_pos })
        })
    })

    let owner_color = {
        'Player1': 'from-zinc-400 to-zinc-50',
        'Player2': 'from-black to-slate-800',
        'Gaia': 'from-gray-700 to-gray-500',
    }

    $: moving = destination_div_pos.x != $div_pos.x || destination_div_pos.y != $div_pos.y
</script>

{#if pawn}
<div 
class="absolute w-12 h-12 flex justify-center items-center"
style={`top: ${$div_pos.y}px; left: ${$div_pos.x}px;`} 
>
    <div class={"w-10 h-10 transition-all rounded-full bg-gradient-to-t shadow-md shadow-black/20 text-blue-600 " + owner_color[pawn.owner] + ( moving ? " scale-110 z-10 shadow-xl shadow-black/30" : "" )}>
        {#if moving}
            MOVING
        {/if}
    </div>
</div>
{/if}
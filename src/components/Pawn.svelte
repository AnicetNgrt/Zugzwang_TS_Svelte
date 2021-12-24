<script lang="ts">
    import type { Pawn } from "@game";
    import { tweened } from 'svelte/motion';
    import { cubicInOut, cubicOut } from 'svelte/easing';
    import type { Writable } from "svelte/store";
    import { onMount } from "svelte";


    export let pawn: Pawn

    let div_pos = tweened({ x: window.innerWidth/2, y: -1000 }, { duration: 400, easing: cubicInOut })
    let tile_id = ''

    if (pawn.state == 'Placed') {
        tile_id = pawn.owner+"-pb-"+pawn.id
    } else if (pawn.state == 'Staging') {
        tile_id = pawn.owner+"-pb-"+pawn.id
    }

    onMount(() => {
        div_pos.set({
            x: document.getElementById(tile_id).getBoundingClientRect().x,
            y: document.getElementById(tile_id).getBoundingClientRect().y
        })
    })

    let owner_color = {
        'Player1': 'from-zinc-400 to-zinc-50',
        'Player2': 'from-black to-slate-800',
        'Gaia': 'from-gray-700 to-gray-500',
    }

</script>

<div 
    class="absolute w-12 h-12 flex justify-center items-center"
    style={`top: ${$div_pos.y}px; left: ${$div_pos.x}px;`} 
>
    <div class={"w-10 h-10 rounded-full bg-gradient-to-t shadow-md shadow-black/20 text-blue-600 " + owner_color[pawn.owner] }>
        {pawn.id}
    </div>
</div>
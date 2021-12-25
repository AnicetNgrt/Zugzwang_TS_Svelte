<script lang="ts">
    import { GameSession, ModifierPlacePawn, Pawn, update_selector } from "@game";
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
    
    let selectable = false
    let selected = false

    const on_session_update = (session: GameSession) => {
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

        selectable = session.selector.is_of_type('Pawn') ? 
            session.selector.is_candidate(session, pawn) : false
        selected = session.selector.is_of_type('Pawn') ? 
            session.selector.is_selected(pawn) : false
    }

    function try_select() {
        $session = update_selector($session, selector => {
            selector.toggle($session, pawn)
            return selector
        })
    }

    onMount(() => session.subscribe(on_session_update))

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
    on:click={try_select}
    >
        <div class={"w-10 h-10 flex justify-center items-center transition-all rounded-full bg-gradient-to-t shadow-md shadow-black/20 text-blue-600 box-content " + owner_color[pawn.owner] + ( moving ? " scale-110 z-10 shadow-xl shadow-black/30" : "" ) + (selectable ? " cursor-pointer" : " cursor-not-allowed") + (selected ? " scale-110 z-10 shadow-xl shadow-black/30 opacity-100" : " opacity-80") + (!selected && selectable ? " animate-opacity" : "") }>
            
        </div>
    </div>
{/if}

<style>
    .animate-opacity {
        animation: onoff 3s linear infinite;
    }

    @keyframes onoff {
        0%, 100% {
            opacity: 0.6;
        }

        50% {
            opacity: 1;
        }
    }
</style>
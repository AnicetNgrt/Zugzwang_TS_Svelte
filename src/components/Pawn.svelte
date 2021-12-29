<script lang="ts">
    import { GameSession, Pawn, Selectable, Selector, update_selector } from "@game";
    import { tweened } from 'svelte/motion';
    import { quartInOut } from 'svelte/easing';
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";

    export let id: number

    const session: Writable<GameSession> = getContext('mainGame')
    
    let pawn: Pawn
    
    let mounted = false
    let tile_id = ''
    
    let div_pos = tweened({ x: 0, y: 0 }, { duration: 500, easing: quartInOut })
    let destination_div_pos
    refresh_destination_div_pos()
    
    let selectable = false
    let selected = false

    const on_session_update = (session: GameSession) => {
        pawn = session.game.pawns[id]

        if (pawn.state == 'Placed') {
            tile_id = "board-"+pawn.x+"-"+pawn.y
        } else if (pawn.state == 'Staging') {
            tile_id = pawn.owner+"-pb-"+pawn.id
        }

        refresh_destination_div_pos()

        selectable = session.selector.is_candidate(session, new Selectable(pawn, 'Pawn'))
        selected = session.selector.is_selected(session, new Selectable(pawn, 'Pawn'))
    }

    function try_select() {
        $session = update_selector($session, (selector: Selector) => {
            selector.toggle($session, new Selectable(pawn, 'Pawn'))
            return selector
        })
    }

    function refresh_destination_div_pos() {
        if (!mounted) {
            destination_div_pos = { x: -1000, y: -1000 }
        } else if (!document.getElementById(tile_id)) {
            destination_div_pos = { x: window.innerWidth/2, y: -1000 }
        } else {
            const div = document.getElementById(tile_id)
            destination_div_pos = {
                x: div.getBoundingClientRect().x
                    + window.scrollX,
                y: div.getBoundingClientRect().y 
                    + window.scrollY
            }
        }
        div_pos.set({ ...destination_div_pos })
    }

    onMount(() => {
        refresh_destination_div_pos()
        session.subscribe(on_session_update)
        mounted = true

        window.addEventListener('resize', refresh_destination_div_pos)
        window.addEventListener('scroll', refresh_destination_div_pos)
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
    class="absolute w-8 sm:w-11 h-8 sm:h-11 flex justify-center items-center"
    style={`top: ${$div_pos.y}px; left: ${$div_pos.x}px;`}
    on:click={try_select}
    >
        <div class={"w-7 sm:w-9 h-7 sm:h-9 flex justify-center items-center transition-all rounded-full bg-gradient-to-t shadow-md shadow-black/20 text-blue-600 box-content " + owner_color[pawn.owner] + ( moving ? " scale-110 z-10 shadow-xl shadow-black/30" : "" ) + (selectable ? " cursor-pointer" : " cursor-not-allowed") + (selected ? " scale-110 z-10 shadow-xl shadow-black/30 opacity-100" : " opacity-80") + (!selected && selectable ? " ring-4 ring-accent-300/50" : "") }>
            <!-- {moving} -->
        </div>
    </div>
{/if}
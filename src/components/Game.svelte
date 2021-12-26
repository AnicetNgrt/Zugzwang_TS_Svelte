<script lang="ts">
    import Board from "@components/Board.svelte";
    import PawnBox from "@components/PawnBox.svelte";
    import { Writable, writable } from "svelte/store";
    import { onMount, setContext } from "svelte";
    import Pawn from "@components/Pawn.svelte";
    import PanelButton from "@components/PanelButton.svelte";
    import { apply, can_play, DummySelector, ModifierAddPawn, ModifierEndTurn, new_game, place_pawn, rollback, update_selector } from "@game";
    import type { Modifier, GameSession } from "@game";
    
    const game = new_game({
        width: 15,
        height: 10,
        max_pawn_per_player: 3
    })

    let session: Writable<GameSession> = writable({
        game,
        player: 'Player1',
        done: new Array<Modifier>(),
        selector: new DummySelector()
    })

    let can_end_turn = false
    let can_undo = false

    function place_pawn_cycle() {
        const selector = place_pawn(modifier => {
            $session = apply($session, modifier)
            setTimeout(place_pawn_cycle, 100)
        })
        $session = update_selector($session, _ => selector)
    }

    for (let i = 0; i < 3; i++) {
        $session = apply($session, new ModifierAddPawn('Player1'))
        $session = apply($session, new ModifierAddPawn('Player2'))
    }
    $session = apply($session, new ModifierEndTurn())


    session.subscribe(session => {
        can_end_turn = can_play(session.game, new ModifierEndTurn(), session.player)

        let i = session.done.length-1
        for (; i >= 0; i--) {
            if (session.done[i] instanceof ModifierEndTurn) break
        }
        can_undo = i < (session.done.length-1)
    })

    function try_end_turn() {
        if (can_end_turn) {
            $session = apply($session, new ModifierEndTurn())
            $session = { ...$session, player: $session.player == 'Player1' ? 'Player2' : 'Player1' }
        }
    }

    function try_undo() {
        if (can_undo) {
            $session = rollback($session)
        }
    }

    onMount(place_pawn_cycle)

    setContext('mainGame', session)
</script>

<div class="flex flex-col gap-3">
    <div class="flex justify-center items-end gap-2">
        <div class="pr-2 text-red-400/50 font-sans flex flex-col">
            <div class="h-4 text-xl">turn</div>
            <div class="flex mt-1">
                <div class="text-xl mr-1">
                    n°
                </div>
                <div class={"font-serif text-5xl w-14" + ($session.game.turn % 2 == 0 ? " text-black/60" : " text-white/50")}>
                    { $session.game.turn < 10 ? '0'+$session.game.turn : $session.game.turn }
                </div>
            </div>
        </div>
        <PanelButton disabled={!can_end_turn} class="h-14 flex items-center px-6" on_click={try_end_turn}>
            <h1 class="text-3xl group-hover:text-red-700 text-red-800/70">end turn</h1>
        </PanelButton>
        <PanelButton disabled={!can_undo} class="h-10 flex items-center px-6" on_click={try_undo}>
            <h1 class="text-xl group-hover:text-red-700 text-red-800/70">undo</h1>
        </PanelButton>
    </div>
    <Board id="board"/>
    <div class="flex justify-center gap-3">
        <PawnBox 
            id="Player1-pb"
            ids={$session.game.pawns.filter(p => p.owner == 'Player1').map(p => p.id)}
            min={$session.game.rules.max_pawn_per_player}
        />
        <PawnBox 
            id="Player2-pb" 
            ids={$session.game.pawns.filter(p => p.owner == 'Player2').map(p => p.id)} 
            min={$session.game.rules.max_pawn_per_player}
            revert
        />
    </div>
</div>

{#each $session.game.pawns as {id}}
    <Pawn {id}/>
{/each}
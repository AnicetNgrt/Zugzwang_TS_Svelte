<script lang="ts">
    import { apply, Modifier, ModifierAddPawn, new_game } from "@game";
    import Board from "@components/Board.svelte";
    import PawnBox from "./PawnBox.svelte";
    import { writable, Writable } from "svelte/store";
    import Pawn from "./Pawn.svelte";

    const game = new_game({
        width: 15,
        height: 10,
        max_pawn_per_player: 4
    })

    let session = writable({
        game,
        done: new Array<Modifier>()
    })

    let tiles_dom: Writable<{[key: string]: HTMLDivElement}> = writable({})

    $session = apply($session, new ModifierAddPawn('Player1'))
    $session = apply($session, new ModifierAddPawn('Player1'))
    $session = apply($session, new ModifierAddPawn('Player1'))
    $session = apply($session, new ModifierAddPawn('Player1'))

    setTimeout(() => {
        $session = apply($session, new ModifierAddPawn('Player2'))
        $session = apply($session, new ModifierAddPawn('Player2'))
        setTimeout(() => {
            $session = apply($session, new ModifierAddPawn('Player2'))
        }, 400)
    }, 400)
</script>

<div class="flex flex-col gap-3">
    <div class="flex justify-between gap-3">
        <div class="w-1/3">
            <PawnBox 
                id="Player1-pb"
                ids={$session.game.pawns.filter(p => p.owner == 'Player1').map(p => p.id)}
                min={$session.game.rules.max_pawn_per_player}
                {tiles_dom}
                {session}
            />
        </div>
        <div class="w-1/3 z-10 flex justify-center items-center">
            <h1 class="text-5xl font-thin text-red-400/40">ZUGZWANG</h1>
        </div>
        <div class="w-1/3 flex justify-end">
            <PawnBox 
                id="Player2-pb" 
                ids={$session.game.pawns.filter(p => p.owner == 'Player2').map(p => p.id)} 
                min={$session.game.rules.max_pawn_per_player}
                {tiles_dom}
                {session}
                revert
            />
        </div>
    </div>
    <Board {session} id="board" {tiles_dom} board={$session.game.board}/>
</div>

{#each $session.game.pawns as pawn}
    <Pawn {pawn} {tiles_dom} />
{/each}
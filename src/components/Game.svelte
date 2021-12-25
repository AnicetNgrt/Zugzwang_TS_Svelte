<script lang="ts">
    import { apply, GameSession, Modifier, ModifierAddPawn, new_game } from "@game";
    import Board from "@components/Board.svelte";
    import PawnBox from "./PawnBox.svelte";
    import { Writable, writable } from "svelte/store";
    import Pawn from "./Pawn.svelte";
    import { setContext } from "svelte";

    const game = new_game({
        width: 15,
        height: 10,
        max_pawn_per_player: 3
    })

    let session: Writable<GameSession> = writable({
        game,
        player: 'Player1',
        done: new Array<Modifier>(),
        selected_pawn_id: -1,
        selected_tile_position: { x: -1, y: -1 },
        selected_pawn_filter: _ => true,
        selected_tile_filter: _ => true
    })

    for (let i = 0; i < 3; i++) {
        $session = apply($session, new ModifierAddPawn('Player1'))
        $session = apply($session, new ModifierAddPawn('Player2'))
    }

    setContext('mainGame', session)
</script>

<div class="flex flex-col gap-3">
    <div class="flex justify-between gap-3">
        <div class="w-1/3">
            <PawnBox 
                id="Player1-pb"
                ids={$session.game.pawns.filter(p => p.owner == 'Player1').map(p => p.id)}
                min={$session.game.rules.max_pawn_per_player}
            />
        </div>
        <div class="w-1/3 flex justify-center items-center">
            <h1 class="text-5xl font-thin text-red-400/40">ZUGZWANG</h1>
        </div>
        <div class="w-1/3 flex justify-end">
            <PawnBox 
                id="Player2-pb" 
                ids={$session.game.pawns.filter(p => p.owner == 'Player2').map(p => p.id)} 
                min={$session.game.rules.max_pawn_per_player}
                revert
            />
        </div>
    </div>
    <Board id="board"/>
</div>

{#each $session.game.pawns as {id}}
    <Pawn {id}/>
{/each}
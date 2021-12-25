<script lang="ts">
    import { apply, Modifier, ModifierAddPawn, ModifierMovePawn, ModifierPlacePawn, new_game } from "@game";
    import Board from "@components/Board.svelte";
    import PawnBox from "./PawnBox.svelte";
    import { writable } from "svelte/store";
    import Pawn from "./Pawn.svelte";
    import { setContext } from "svelte";

    const game = new_game({
        width: 15,
        height: 10,
        max_pawn_per_player: 4
    })

    let session = writable({
        game,
        done: new Array<Modifier>()
    })

    for (let i = 0; i < 10; i++) {
        $session = apply($session, new ModifierAddPawn('Player1'))
        $session = apply($session, new ModifierAddPawn('Player2'))
    }

    function rand_range(min: number, max: number): number {
        const num = Math.round(min+((max-min)*Math.random()))
        return num
    }

    setTimeout(() => {
        const timer = ms => new Promise(res => setTimeout(res, ms))

        async function move_random_pawn() {
            for (let i = 0; i < 10000; i++) {
                const pawn_id = rand_range(0, 7)
                const x = rand_range(0, 14)
                const y = rand_range(0, 9)
                let modifier: Modifier

                if ($session.game.pawns[pawn_id].state == 'Staging') {
                    modifier = new ModifierPlacePawn(pawn_id, { x, y })
                } 
                else {
                    modifier = new ModifierMovePawn(pawn_id, { x, y })
                }

                $session = apply($session, modifier)
                await timer(rand_range(1000, 1200))
            }
        }

        move_random_pawn()
    }, 400)

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
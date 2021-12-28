<script lang="ts">
    import Board from "@components/Board.svelte";
    import { Writable, writable } from "svelte/store";
    import { onMount, setContext } from "svelte";
    import Pawn from "@components/Pawn.svelte";
    import { apply, DummySelector, ModifierAddPawn, ModifierEndTurn, new_game, play_selector, update_selector } from "@game";
    import type { Modifier, GameSession } from "@game";
    import StagingPawnsBoxes from "@components/StagingPawnsBoxes.svelte";
    import TurnDashboard from "@components/TurnDashboard.svelte";
    import PlayerPane from "@components/PlayerPane.svelte";
    
    const game = new_game({
        width: 15,
        height: 10,
        max_pawn_per_player: 3,
        max_ap: 4
    })

    let session: Writable<GameSession> = writable({
        game,
        player: 'Player1',
        done: new Array<Modifier>(),
        selector: new DummySelector(),
        players_metadata: new Map([
            ['Player1', { name: '@AniC_dev' }],
            ['Player2', { name: '@John_Doe' }]
        ])
    })

    function play_cycle() {
        const selector = play_selector(modifier => {
            $session = apply($session, modifier)
            setTimeout(play_cycle, 100)
        })
        $session = update_selector($session, _ => selector)
    }

    for (let i = 0; i < 3; i++) {
        $session = apply($session, new ModifierAddPawn('Player1'))
        $session = apply($session, new ModifierAddPawn('Player2'))
    }
    $session = apply($session, new ModifierEndTurn())

    onMount(play_cycle)

    setContext('mainGame', session)
</script>

<div class="flex flex-col w-full items-center">
    <div class="flex gap-3 justify-center">
        <PlayerPane player={'Player1'}/>
        <div class="flex flex-col gap-3 items-center">
            <TurnDashboard/>
            <Board id="board"/>
            <StagingPawnsBoxes/>
        </div>
        <PlayerPane player={'Player2'}/>
    </div>
</div>

{#each $session.game.pawns as {id}}
    <Pawn {id}/>
{/each}
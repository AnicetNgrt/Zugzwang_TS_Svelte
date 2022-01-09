<script lang="ts">
    import Board from "@components/Board.svelte";
    import { Writable, writable } from "svelte/store";
    import { setContext } from "svelte";
    import Pawn from "@components/Pawn.svelte";
    import { apply, DummySelector, ModifierAddCardStack, ModifierAddPawn, ModifierEndTurn, new_game, play_selector, StackAttack, StackKnight, StackSmallRivers, update_selector } from "@game";
    import type { Modifier, GameSession } from "@game";
    import TurnDashboard from "@components/TurnDashboard.svelte";
    import BoardBottom from "@components/BoardBottom.svelte";
    import PlayersSide from "@components/PlayersSide.svelte";
    
    const game = new_game({
        width: 15,
        height: 10,
        max_pawn_per_player: 3,
        max_weight: 10,
        max_ap: 4
    })

    let done_count = 0
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

    for (let i = 0; i < game.rules.max_pawn_per_player; i++) {
        $session = apply($session, new ModifierAddPawn('Player1'))
        $session = apply($session, new ModifierAddPawn('Player2'))
    }
    $session = apply($session, new ModifierAddCardStack(StackSmallRivers, 'Player1'))
    $session = apply($session, new ModifierAddCardStack(StackKnight, 'Player1'))
    $session = apply($session, new ModifierAddCardStack(StackAttack, 'Player1'))
    $session = apply($session, new ModifierAddCardStack(StackSmallRivers, 'Player2'))
    $session = apply($session, new ModifierAddCardStack(StackKnight, 'Player2'))
    $session = apply($session, new ModifierAddCardStack(StackAttack, 'Player2'))
    $session = apply($session, new ModifierEndTurn())

    session.subscribe(updated_session => {
        if (done_count != updated_session.done.length) {
            const selector = play_selector(updated_session, modifier => {
                $session = apply($session, modifier)
            })
            setTimeout(() => {
                $session = update_selector(updated_session, _ => selector)
            }, 1)
        }
        done_count = updated_session.done.length
    })

    setContext('mainGame', session)
</script>

<div class="flex flex-col max-w-full items-center mt-4">
    <div class="flex gap-8 justify-center flex-wrap">
        <div class="hidden md:block"><PlayersSide player="Player1"/></div>
        <div class="flex flex-col gap-3 items-center max-w-full">
            <TurnDashboard/>
            <Board id="board"/>
            <BoardBottom/>
        </div>
        <div class="block md:hidden h-max"><PlayersSide player="Player1"/></div>
        <div class=""><PlayersSide player="Player2"/></div>
    </div>
</div>

{#each $session.game.pawns as {state, id}}
    {#if state != 'Dead'}
        <Pawn {id}/>
    {/if}
{/each}
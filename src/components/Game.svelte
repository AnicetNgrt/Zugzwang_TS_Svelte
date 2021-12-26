<script lang="ts">
    import { apply, Tile, GameSession, Modifier, ModifierAddPawn, Pawn as GamePawn, new_game, SimpleSelector, DummySelector, update_selector, ModifierPlacePawn, is_current_player, ModifierEndTurn, can_play, Selectable, rollback } from "@game";
    import Board from "@components/Board.svelte";
    import PawnBox from "@components/PawnBox.svelte";
    import { Writable, writable } from "svelte/store";
    import { onMount, setContext } from "svelte";
    import Pawn from "@components/Pawn.svelte";
    import PanelButton from "@components/PanelButton.svelte";
    
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

    function place_pawn_cyle() {
        $session = update_selector($session, _ => {
            const on_pawn_selected = (els: [Selectable[]]) => {
                const pawns_ids = els[0].map(el => el.as_pawn().id)
                $session = update_selector($session, _ => {
                    return new SimpleSelector(
                        'Tile',
                        1,
                        (session, el) => {
                            const tile = el.as_tile()
                            let modifier = new ModifierPlacePawn(pawns_ids[0], {
                                x: tile.x,
                                y: tile.y
                            })
                            return modifier.is_playable(session.game, session.player)
                                && modifier.is_allowed(session.game)
                        },
                        (els: [Selectable[]]) => {
                            const tile = els[0][0].as_tile()
                            let modifier = new ModifierPlacePawn(pawns_ids[0], {
                                x: tile.x,
                                y: tile.y
                            })
                            $session = apply($session, modifier)
                            setTimeout(place_pawn_cyle, 100)
                        }
                    )
                })
            }

            return new SimpleSelector(
                'Pawn',
                1,
                (session, el) => {
                    const pawn = el.as_pawn()
                    if (pawn.owner == 'Gaia') return false
                    return is_current_player(session.game, pawn.owner)
                        && session.player == pawn.owner
                        && pawn.state == 'Staging'
                },
                (els) => setTimeout(
                    () => on_pawn_selected(els),
                    100
                )
            )
        })
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

    onMount(place_pawn_cyle)

    setContext('mainGame', session)
</script>

<div class="flex flex-col gap-3">
    <div class="flex justify-between gap-3">
        <PawnBox 
            id="Player1-pb"
            ids={$session.game.pawns.filter(p => p.owner == 'Player1').map(p => p.id)}
            min={$session.game.rules.max_pawn_per_player}
        />
        <div class="flex justify-center items-center gap-2">
            {#if can_end_turn}
                <PanelButton class="h-14 flex items-center px-6" on_click={try_end_turn}>
                    <h1 class="text-2xl font-light group-hover:text-red-700 text-red-800/70">end turn</h1>
                </PanelButton>
            {/if}
            {#if can_undo}
                <PanelButton class="h-14 flex items-center px-6" on_click={try_undo}>
                    <h1 class="text-2xl font-light group-hover:text-red-700 text-red-800/70">undo</h1>
                </PanelButton>
            {/if}
        </div>
        <PawnBox 
            id="Player2-pb" 
            ids={$session.game.pawns.filter(p => p.owner == 'Player2').map(p => p.id)} 
            min={$session.game.rules.max_pawn_per_player}
            revert
        />
    </div>
    <Board id="board"/>
</div>

{#each $session.game.pawns as {id}}
    <Pawn {id}/>
{/each}
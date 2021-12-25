<script lang="ts">
    import { apply, Tile, GameSession, Modifier, ModifierAddPawn, Pawn as GamePawn, new_game, SimpleSelector, DummySelector, update_selector, ModifierPlacePawn, is_current_player } from "@game";
    import Board from "@components/Board.svelte";
    import PawnBox from "./PawnBox.svelte";
    import { Writable, writable } from "svelte/store";
    import { onMount, setContext } from "svelte";
    import Pawn from "@components/Pawn.svelte";
    
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

    function place_pawn_cyle() {
        $session = update_selector($session, _ => {
            const on_pawn_selected = (pawns_ids) => {
                $session = update_selector($session, _ => {
                    return new SimpleSelector<Tile, number>(
                        'Tile',
                        1,
                        tile => $session.game.rules.width*tile.y+tile.x,
                        (session, tile) => {
                            let modifier = new ModifierPlacePawn(pawns_ids[0], {
                                x: tile.x,
                                y: tile.y
                            })
                            return modifier.is_playable(session.game, session.player)
                                && modifier.is_allowed(session.game)
                        },
                        (tiles_ids) => {
                            let modifier = new ModifierPlacePawn(pawns_ids[0], {
                                x: tiles_ids[0][0] % $session.game.rules.width,
                                y: tiles_ids[0][0]/$session.game.rules.width
                            })
                            $session = apply($session, modifier)
                            place_pawn_cyle()
                        }
                    )
                })
            }

            return new SimpleSelector<GamePawn, number>(
                'Pawn',
                1,
                pawn => pawn.id,
                (session, pawn) => {
                    if (pawn.owner == 'Gaia') return false
                    return is_current_player(session.game, pawn.owner)
                        && session.player == pawn.owner
                        && pawn.state == 'Staging'
                },
                (pawn_ids) => setTimeout(
                    () => on_pawn_selected(pawn_ids),
                    100
                )
            )
        })
    }

    for (let i = 0; i < 3; i++) {
        $session = apply($session, new ModifierAddPawn('Player1'))
        $session = apply($session, new ModifierAddPawn('Player2'))
    }

    onMount(place_pawn_cyle)

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
<script lang="ts">
    import { apply, can_play, GameSession, is_current_player, ModifierEndTurn, rollback } from "@game";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import PanelButton from "@components/PanelButton.svelte";
import Game from "./Game.svelte";
import Panel from "./Panel.svelte";
    
    const session: Writable<GameSession> = getContext('mainGame')

    let can_end_turn = false
    let can_undo = false

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
</script>

<div class="flex w-full justify-between">
    <div class="flex justify-center items-end gap-2">
        <div class="pr-2 text-primary-400/50 font-sans flex flex-col">
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
            <h1 class="text-3xl group-hover:text-primary-800 text-primary-900/90">end turn</h1>
        </PanelButton>
        <PanelButton disabled={!can_undo} class="h-10 flex items-center px-6" on_click={try_undo}>
            <h1 class="text-xl group-hover:text-primary-800 text-primary-900/90">undo</h1>
        </PanelButton>
    </div>
    <div class="flex gap-3 items-baseline self-end">
        <p class={"flex flex-col items-end text-md text-white/40"}>
            <span class={"h-4 font-bold"}>
                {$session.players_metadata.get('Player1').name}
            </span>
            {#if is_current_player($session.game, 'Player1')}
                <span class="text-sm">playing...</span>
            {/if}
        </p>
        <span class="text-xs font-serif text-primary-400/60">
            VS
        </span>
        <p class={"flex flex-col text-md text-black/70"}>
            <span class={"h-4 font-bold"}>
                {$session.players_metadata.get('Player2').name}
            </span>
            {#if is_current_player($session.game, 'Player2')}
                <span class="text-sm">...playing</span>
            {/if}
        </p>
    </div>
</div>
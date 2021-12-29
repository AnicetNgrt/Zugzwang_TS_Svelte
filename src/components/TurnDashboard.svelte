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

<div class="flex mx-3 sm:mx-5 md:mx-10 max-w-full md:w-full justify-center md:justify-between flex-wrap-reverse md:flex-nowrap gap-x-3 gap-y-3">
    <div class="flex gap-3">
        <PanelButton disabled={!can_end_turn} class="self-end h-10 flex items-center px-6" on_click={try_end_turn}>
            <h1 class="text-md md:text-xl group-hover:text-primary-800 text-primary-900/90">end turn</h1>
        </PanelButton>
        <PanelButton disabled={!can_undo} class="self-end h-10 flex items-center px-6" on_click={try_undo}>
            <h1 class="text-md md:text-xl group-hover:text-primary-800 text-primary-900/90">undo</h1>
        </PanelButton>
    </div>
    <div class="flex gap-3 items-baseline mt-3 md:self-end">
        <p class={"flex flex-col items-end text-md text-white/60"}>
            <span class={"h-4 font-bold"}>
                {$session.players_metadata.get('Player1').name}
            </span>
            {#if is_current_player($session.game, 'Player1')}
                <span class="text-sm">playing...</span>
            {/if}
        </p>
        <span class="text-xs text-primary-400/80">
            VS
        </span>
        <p class={"flex flex-col text-md text-black/90"}>
            <span class={"h-4 font-bold"}>
                {$session.players_metadata.get('Player2').name}
            </span>
            {#if is_current_player($session.game, 'Player2')}
                <span class="text-sm">...playing</span>
            {/if}
        </p>
    </div>
</div>
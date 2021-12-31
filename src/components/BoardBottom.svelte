<script lang="ts">
    import type { GameSession } from "@game";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import PawnBox from "@components/PawnBox.svelte";

    const session: Writable<GameSession> = getContext('mainGame')
</script>

<div class="flex max-w-full justify-between gap-3">
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
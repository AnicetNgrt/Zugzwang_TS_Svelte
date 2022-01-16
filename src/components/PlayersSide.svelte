<script lang="ts">
    import { Archetype, Card, CardStack, GameSession, is_current_player, Player, PlayerMetadata } from "@game";
    import { getContext, onMount } from "svelte";
    import { writable, Writable } from "svelte/store";
    import CardToggle from "@components/CardToggle.svelte";
    import CardDetail from "@components/CardDetail.svelte";

    const session: Writable<GameSession> = getContext('mainGame')

    export let player: Player

    let player_metadata: PlayerMetadata
    let ap: number
    let is_playing: boolean

    type UICardStack = Array<{ top_id: number, first_usable: boolean, cards: Card[], amount_usable: number, amount_used: number }>

    let ui_card_stacks: UICardStack[] = []
    let mounted = false

    let toggled_card: Writable<Card> = writable(null)

    const on_session_update = (session: GameSession) => {
        player_metadata = session.players_metadata.get(player)
        ap = session.game.action_points.get(player)
        is_playing = is_current_player(session.game, player)

        ui_card_stacks = session.game.card_stacks.get(player).map(({stack}) => {
            let ui_card_stack: UICardStack = new Array()
            let previous_archetype: Archetype = null
            let top_used = true
            let first_usable_attributed = false
            for (const card_id of stack) {
                const card = session.game.cards.get(card_id)

                if (card.archetype == previous_archetype) {
                    ui_card_stack[ui_card_stack.length-1].cards.push(card)
                    if (card.used) {
                        ui_card_stack[ui_card_stack.length-1].amount_used += 1
                    } else {
                        ui_card_stack[ui_card_stack.length-1].amount_usable += 1
                    }
                } else {
                    ui_card_stack.push({
                        top_id: card.id, 
                        first_usable: false,
                        amount_usable: card.used ? 0 : 1, 
                        amount_used: card.used ? 1 : 0,
                        cards: [ card ] 
                    })
                    top_used = card.used
                }

                if (top_used) {
                    ui_card_stack[ui_card_stack.length-1].top_id = card.id
                    top_used = card.used
                }

                if (!card.used && !first_usable_attributed) {
                    ui_card_stack[ui_card_stack.length-1].first_usable = true
                    first_usable_attributed = true
                }

                previous_archetype = card.archetype
            }
            return ui_card_stack
        })

        if ($toggled_card && $toggled_card.used) {
            ui_card_stacks.forEach(stack => {
                const i = stack.findIndex(family => family.cards.some(c => c.id == $toggled_card.id))
                if (i == -1) return
                const j = stack[i].cards.findIndex(c => c.id == $toggled_card.id)
                if (j == -1) return
                if (j < stack[i].cards.length-1) {
                    if (i < stack.length-1){
                        $toggled_card = stack[i+1].cards[0]
                    } else {
                        $toggled_card = stack[i].cards[j+1]
                    }
                }
            })
        }
    }

    onMount(() => {
        session.subscribe(on_session_update)
        mounted = true
    })
</script>

{#if mounted}
<div class={"w-fit flex flex-col mt-2 px-3 py-2 pb-3 rounded-sm shadow-xl shadow-primary-800/10" + (player == 'Player1' ? " bg-white/30 items-end" : " bg-black/30 items-start") + " backdrop-blur-lg"}>
    <h1 class={"text-xl font-bold mb-1" + (player == 'Player1' ? " text-black/40" : " text-white/40")}>
        {player_metadata.name}
    </h1>
    <div class={"flex h-14 w-full mb-2 gap-2 bg-accent-800/40 rounded-sm justify-center items-center" + (player == 'Player1' ? " text-black/60" : " text-white/60") + (is_playing ? "" : " hidden")}>
        <h1 class="text-4xl font-bold mr-4 text-accent-400/80">PLAYING</h1>
        <h1 class={"text-4xl font-light" + (ap > 0 ? " text-accent-300/90" : " text-accent-300/40")}>{ap}</h1>
        <p class={"text-lg leading-4 mb-1 w-min" + (ap > 0 ? " text-accent-400/80" : " text-accent-400/40") }>action points</p>
    </div>
    <div class="grid grid-cols-2 gap-1 w-full h-fit">
        {#each ui_card_stacks as stack}
            <div class={"flex flex-col bg-accent-400/20 p-1.5 items-center h-fit gap-1 rounded-sm" + (player == 'Player1' ? "  border-white/10" : "  border-black/10") + ($toggled_card ? " h-0 scale-y-0 gap-0 py-0" : " ")}>
                {#each stack as {top_id, amount_usable, amount_used, first_usable}}
                    <CardToggle {toggled_card} on_top={first_usable} id={top_id} {amount_usable} {amount_used}/>
                {/each}
            </div>
        {/each}
    </div>
    {#if $toggled_card}
        <CardDetail card={$toggled_card} on_closed={() => $toggled_card = null}/>
    {/if}
</div>
{/if}
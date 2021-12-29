<script lang="ts">
    let className = ''
    export { className as class }

    export let on_click: () => void
    export let disabled = false
</script>

<div on:click={on_click} class={className + " min-w-fit group backdrop-blur-md rounded-full bg-primary-400/20 shadow-xl border-b-2 border-b-primary-700/20 shadow-primary-900/20 cursor-pointer hover:bg-accent-400/60 hover:border-b-accent-600/70 hover:shadow-primary-900/50 hover:scale-105 active:scale-100 transition-all select-none" + (disabled ? " opacity-40 pointer-events-none cursor-not-allowed" : "")}>
    <slot/>
</div>
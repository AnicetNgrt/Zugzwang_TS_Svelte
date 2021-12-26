<script lang="ts">
    let className = ''
    export { className as class }

    export let on_click: () => void
</script>

<div on:click={on_click} class={className + " group backdrop-blur-md rounded-full bg-red-400/40 shadow-xl border-b-2 border-b-red-800/50 shadow-red-900/20 cursor-pointer hover:bg-red-400/60 hover:border-b-red-600/70 hover:shadow-red-900/50 hover:scale-105 active:border-b-2 transition-all select-none"}>
    <slot/>
</div>
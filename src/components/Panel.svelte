<script lang="ts">
    let className = ''
    export { className as class }
</script>

<div class={className + " backdrop-blur-md rounded-sm bg-red-400/40 shadow-xl border-b-2 border-b-red-800/50 shadow-red-900/20"}>
    <slot/>
</div>
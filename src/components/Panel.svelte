<script lang="ts">
    let className = ''
    export { className as class }
</script>

<div class={className + " backdrop-blur-md rounded-sm bg-primary-400/40 shadow-xl border-b-2 border-b-primary-800/50 shadow-primary-900/20"}>
    <slot/>
</div>
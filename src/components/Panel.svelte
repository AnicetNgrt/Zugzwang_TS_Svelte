<script lang="ts">
    let className = ''
    export { className as class }
</script>

<div class={className + " backdrop-blur-md rounded-sm bg-primary-400/20 border-b-2 border-b-primary-700/20 shadow-xl shadow-primary-800/20"}>
    <slot/>
</div>
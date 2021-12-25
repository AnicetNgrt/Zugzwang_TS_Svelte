<script>
    import Game from "@components/Game.svelte";
    import BackgroundShader from "@components/BackgroundShader.svelte";
</script>

<BackgroundShader/>
<div class="relative top-0 left-0 w-screen min-h-screen flex flex-col justify-center items-center z-10">
    <Game/>
</div>
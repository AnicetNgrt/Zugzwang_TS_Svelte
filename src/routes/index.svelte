<script>
    import Game from "@components/Game.svelte";
    import BackgroundShader from "@components/BackgroundShader.svelte";
</script>

<BackgroundShader/>
<div class="w-screen min-h-screen flex flex-col justify-center items-center z-10">
    <Game/>
</div>
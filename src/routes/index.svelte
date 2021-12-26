<script>
    import Game from "@components/Game.svelte";
    import BackgroundShader from "@components/BackgroundShader.svelte";
</script>

<BackgroundShader/>
<div class="absolute w-screen h-screen">
    <div class="grid grid-cols-2 gap-4 place-content-between p-4 w-full h-full z-10">
        <div class="col-start-2 flex flex-col items-end">
            <h1 class="text-4xl font-serif text-red-400/75">ZUGZWANG</h1>
            <h1 class="text-md font-sans text-red-400/80">a game by Anicet Nougaret</h1>
        </div>
        <div class="col-start-1 row-start-2 flex flex-col">
            <h1 class="text-md font-sans text-red-400/80">version pre-alpha</h1>
        </div>
    </div>
</div>
<div class="relative top-0 left-0 w-screen min-h-screen flex flex-col justify-center items-center z-10">
    <Game/>
</div>
<script lang="ts">
    import Game from "@components/Game.svelte";
    import BackgroundShader from "@components/BackgroundShader.svelte";

    function hex_to_rgb(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function hex_to_theme(accent: string, color: string) {
        return {
            color: hex_to_rgb(color),
            accent: hex_to_rgb(accent)
        }
    }

    const tw_themes_bg_colors = {
        'slate': hex_to_theme('#94A3B8', '#334155'),
        'gray': hex_to_theme('#9CA3AF', '#374151'),
        'zinc': hex_to_theme('#A1A1AA', '#3F3F46'),
        'neutral': hex_to_theme('#A3A3A3', '#404040'),
        'stone': hex_to_theme('#A8A29E', '#44403C'),
        'red': hex_to_theme('#F87171', '#B91C1C'),
        'orange': hex_to_theme('#FB923C', '#C2410C'),
        'amber': hex_to_theme('#FBBF24', '#B45309'),
        'yellow': hex_to_theme('#FACC15', '#A16207'),
        'lime': hex_to_theme('#A3E635', '#4D7C0F'),
        'green': hex_to_theme('#4ADE80', '#15803D'),
        'emerald': hex_to_theme('#34D399', '#047857'),
        'teal': hex_to_theme('#2DD4BF', '#0F766E'),
        'cyan': hex_to_theme('#22D3EE', '#0E7490'),
        'sky': hex_to_theme('#38BDF8', '#0369A1'),
        'blue': hex_to_theme('#60A5FA', '#1D4ED8'),
        'indigo': hex_to_theme('#818CF8', '#4338CA'),
        'violet': hex_to_theme('#A78BFA', '#6D28D9'),
        'purple': hex_to_theme('#C084FC', '#7E22CE'),
        'fuchsia': hex_to_theme('#E879F9', '#A21CAF'),
        'pink': hex_to_theme('#F472B6', '#BE185D'),
        'rose': hex_to_theme('#FB7185', '#BE123C'),
    }

    const theme = 'amber'
</script>

<BackgroundShader color={tw_themes_bg_colors[theme].color} accent={tw_themes_bg_colors[theme].accent}/>
<div class="absolute w-screen h-screen">
    <div class="grid grid-cols-2 gap-4 place-content-between p-4 w-full h-full z-10">
        <div class="col-start-2 flex flex-col items-end">
            <h1 class="text-2xl font-serif text-primary-400/75">ZUGZWANG</h1>
            <h1 class="text-sm font-sans text-primary-400/80">a game by Anicet Nougaret</h1>
        </div>
        <div class="col-start-1 row-start-2 flex flex-col">
            <h1 class="text-md font-sans text-primary-400/80">version pre-alpha</h1>
        </div>
    </div>
</div>
<div class="relative top-0 left-0 w-screen min-h-screen flex flex-col justify-center items-center z-10">
    <Game/>
</div>
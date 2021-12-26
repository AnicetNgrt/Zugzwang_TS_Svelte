<script>
	import '@mszu/pixi-ssr-shim'
	import * as PIXI from 'pixi.js'
	// This initialization needs to only happen once, even when the component
	// is unmounted and re-mounted
	if (!(PIXI.Renderer.__plugins ?? {}).hasOwnProperty('interaction')) {
		PIXI.Renderer.registerPlugin('interaction', PIXI.InteractionManager)
	}
	if (!(PIXI.Renderer.__plugins ?? {}).hasOwnProperty('batch')) {
		PIXI.Renderer.registerPlugin('batch', PIXI.BatchRenderer)
	}
    // @ts-ignore
	if (!(PIXI.Application._plugins || []).some((plugin) => plugin === PIXI.TickerPlugin)) {
		PIXI.Application.registerPlugin(PIXI.TickerPlugin)
	}

	import { onMount } from 'svelte'

    export let color
    export let accent
		
	let app
	
    let w
    let h

	onMount(async () => {
		app = new PIXI.Application({ 
            resizeTo: document.getElementById('content-div'),
            resolution: 0.5,
            antialias: true,
        })

        const scale = 1;

        // Build geometry.
        const geometry = new PIXI.Geometry()
            .addAttribute('aVertexPosition', // the attribute name
                [0, 0, // x, y
                    w/scale, 0, // x, y
                    w/scale, h/scale,
                    0, h/scale], // x, y
                2) // the size of the attribute
            .addAttribute('aUvs', // the attribute name
                [-w/h/2, -1/2, // u, v
                    w/h/2, -1/2, // u, v
                    w/h/2, 1/2,
                    -w/h/2, 1/2], // u, v
                2) // the size of the attribute
            .addIndex([0, 1, 2, 0, 2, 3])

        const vertexSrc = `
        precision mediump float;

        attribute vec2 aVertexPosition;
        attribute vec2 aUvs;

        uniform mat3 translationMatrix;
        uniform mat3 projectionMatrix;

        varying vec2 vUvs;

        void main() {

            vUvs = aUvs;
            gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

        }`

        // Third effect
        const fragmentWaveSrc = `
        precision mediump float;
        varying vec2 vUvs;
        uniform float time;

        const float PI = 3.14;

        float wave(vec2 p, inout vec3 tangent, float t, float ang, float ampl, float wl, float spd) {
            float k = (2.*PI)/wl;
            float f = (dot(vec2(cos(ang), sin(ang)), p.xy) - spd - t) * k;
            
            tangent += normalize(vec3(1., k*ampl*cos(f), 0.));
            return ampl * sin(f);
        }

        void main()
        {
            float zoom = 1.4;
            float t = ((time*0.2)*zoom)/2.;
            vec2 uv = vUvs;
            uv = (2.*uv) - vec2(1.);
            // uv.x *= iResolution.x/iResolution.y;

            vec3 color = vec3(${color.r}./255., ${color.g}./255., ${color.b}./255.);
            vec3 accent_color = vec3(${accent.r}./255., ${accent.g}./255., ${accent.b}./255.);
            
            vec3 tangent = vec3(0.);
            float h = wave(uv, tangent, -t, PI/2., 0.3, 1.*zoom, 0.1)
                + wave(uv, tangent, t, PI/3.5, 0.4, 0.4*zoom, 10.)
                + wave(uv, tangent, t, PI/4., 0.8, 0.7*zoom, 2.)
                + wave(uv, tangent, -t, PI/4.5, 1., 2.*zoom, 7.);

            vec3 n = vec3(-tangent.y, tangent.x, 0);
            
            vec3 p = vec3(uv.x, h, uv.y);
            vec3 lpos = vec3(cos(t)*1., 2., sin(t)*1.);
            float lam = smoothstep(0., 2., dot(n, normalize(lpos-p)));
            
            vec3 water = smoothstep(-1., 0.4, lam)*vec3(color*0.7);
            vec3 shiny = (vec3(smoothstep(0.9, 1., lam))*accent_color*0.1);
            
            gl_FragColor = vec4(water+shiny, 1.0);
        }`
        
        const waveUniforms = {
            time: 0,
        }
        const waveShader = PIXI.Shader.from(vertexSrc, fragmentWaveSrc, waveUniforms)
        const waveTexture = new PIXI.RenderTexture(new PIXI.BaseRenderTexture({
            width: window.innerWidth/scale,
            height: window.innerHeight/scale,
            scaleMode: PIXI.SCALE_MODES.LINEAR,
            anisotropicLevel: 0
        }))
        const waveQuad = new PIXI.Mesh(geometry, waveShader)
        const waveContainer = new PIXI.Container()
        waveContainer.addChild(waveQuad)

        waveContainer.position.set(0, 0)
        waveContainer.scale.set(scale)

        // Add all phases to stage so all the phases can be seen separately.
        app.stage.addChild(waveContainer)

        // start the animation..
        let time = 0
        app.ticker.maxFPS = 144;
        app.ticker.add((delta) => {
            time += delta/app.ticker.FPS
            // gridQuad.shader.uniforms.zoom = Math.sin(time)*5+10;
            waveQuad.shader.uniforms.time = time

            // @ts-ignore
            app.renderer.render(waveQuad, waveTexture)
        })

		document.getElementById('content-div').appendChild(app.view)
	})
</script>

<div id="content-div" bind:clientWidth={w} bind:clientHeight={h} class="content"></div>

<style>
	.content {
		position: fixed;
		width: 100%;
        height: 100%;
		top: 0;
		left: 0;
		margin: 0;
		box-sizing:content-box;
		display: flex;
		flex-direction: column;
		flex: auto;
	}

    /* :global(canvas) {
        image-rendering: pixelated;
    } */
</style>
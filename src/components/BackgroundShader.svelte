<script context="module" lang="ts">
	//export const prerender = true;
	export const ssr = false;
</script>

<script>
    import { Renderer, Geometry, Program, Mesh } from 'ogl';

	import { onMount } from 'svelte'

    export let colors
    export let theme

    let color
    let accent

    let w
    let h

    let fps
    let dpr = 0.5

    let start_t = performance.now()

    let mounted = false

    function load_shader() {
        const renderer = new Renderer({
            width: w,
            height: h,
            dpr: dpr
        });
        const gl = renderer.gl;
        document.getElementById('content-div').innerHTML = ""
        document.getElementById('content-div').appendChild(gl.canvas);

        // Triangle that covers viewport, with UVs that still span 0 > 1 across viewport
        const geometry = new Geometry(gl, {
            position: {size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3])},
            uv: {size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2])},
        });
        // Alternatively, you could use the Triangle class.

        const program = new Program(gl, {
            vertex: `
                attribute vec2 uv;
                attribute vec2 position;

                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 0, 1);
                }
            `,
            fragment: `
            precision highp float;
            varying vec2 vUv;
            uniform float uTime;

            const float PI = 3.14;

            float wave(vec2 p, inout vec3 tangent, float t, float ang, float ampl, float wl, float spd) {
                float k = (2.*PI)/wl;
                float f = (dot(vec2(cos(ang), sin(ang)), p.xy) - spd - t) * k;
                
                tangent += normalize(vec3(1., k*ampl*cos(f), 0.));
                return ampl * sin(f);
            }

            void main()
            {
                float zoom = 2.;
                float t = ((uTime*0.1)*zoom)/2.;
                vec2 uv = vUv;
                uv = (2.*uv) - vec2(1.);
                uv.x *= ${w/h};

                vec3 color = vec3(${color.r}./255., ${color.g}./255., ${color.b}./255.);
                vec3 accent_color = vec3(${accent.r}./255., ${accent.g}./255., ${accent.b}./255.);
                
                vec3 tangent = vec3(0.);
                float h = wave(uv, tangent, -t, PI/2. - PI*t/30., 0.6, 1.*zoom, 0.1)
                    + wave(uv, tangent, t, PI/3.5 - PI*t/30., 0.8, 0.4*zoom, 10.)
                    + wave(uv, tangent, t, PI/4. - PI*t/30., 1.6, 0.7*zoom, 2.)
                    + wave(uv, tangent, -t, PI/4.5 - PI*t/30., 2., 2.*zoom, 7.);

                vec3 n = vec3(-tangent.y, tangent.x, 0);
                
                vec3 p = vec3(uv.x, h, uv.y);
                vec3 lpos = vec3(cos(t)*1., 2., sin(t)*1.);
                float lam = smoothstep(0., 2., dot(n, normalize(lpos-p)));
                
                vec3 water = smoothstep(0., 0.8, lam)*vec3(color*1.);
                vec3 shiny = (vec3(smoothstep(0.9, 1., lam))*accent_color*0.25);
                
                gl_FragColor = vec4((color*0.6)+water+shiny, 1.0);
            }`,
            uniforms: {
                uTime: {value: start_t},
            },
        });

        const mesh = new Mesh(gl, {geometry, program});

        let times = [];
        let last_balance = performance.now()

        requestAnimationFrame(update);
        function update(t) {
            requestAnimationFrame(update);

            while (times.length > 0 && times[0] <= t - 1000) {
                times.shift();
            }
            times.push(t);
            fps = times.length;

            if (t - last_balance >= 1000) {
                last_balance = t
                let new_dpr = renderer.dpr
                if (fps < 30) {
                    new_dpr = Math.max(0.25, renderer.dpr * 0.8)
                }
                if (fps > 35) {
                    new_dpr = Math.min(0.4, renderer.dpr * 1.2)
                }
                if (fps > 40) {
                    new_dpr = Math.min(0.5, renderer.dpr * 1.2)
                }
                if (fps > 60) {
                    new_dpr = Math.min(0.6, renderer.dpr * 1.2)
                }
                if (new_dpr != renderer.dpr) {
                    dpr = new_dpr
                    renderer.dpr = new_dpr
                    renderer.setSize(w, h)
                    // console.log(`${fps} fps => balancing to ${w*renderer.dpr}x${h*renderer.dpr}`)
                }
            }
            
            program.uniforms.uTime.value = start_t + t * 0.001;

            // Don't need a camera if camera uniforms aren't required
            renderer.render({scene: mesh});
        }

        window.addEventListener('resize', _ => renderer.setSize(w, h))
        window.addEventListener('scroll', _ => renderer.setSize(w, h))
	}

    theme.subscribe(new_theme => {
        color = colors[new_theme].color
        accent = colors[new_theme].accent
        if (mounted) {
            load_shader()
        }
    })

	onMount(() => {
        mounted = true
        load_shader()
    })
</script>

<div id="content-div" bind:clientWidth={w} bind:clientHeight={h} class="content bg-transparent"></div>
<div class="fixed top-2 left-2 flex flex-col font-mono text-xs text-primary-500">
    <!-- <span>{fps}</span>
    <span>{Math.round(dpr*100)/100}</span> -->
</div>

<style>
	.content {
        animation: fadeIn 3s;
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
        opacity:0.5;
	}

    @keyframes fadeIn {
        0% {opacity:0;}
        100% {opacity:0.5;}
    }

    /* :global(canvas) {
        image-rendering: pixelated;
    } */
</style>
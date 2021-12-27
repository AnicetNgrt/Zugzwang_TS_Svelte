<script>
    import {Renderer, Geometry, Program, Mesh} from 'ogl';

	import { onMount } from 'svelte'

    export let color
    export let accent
	
    let w
    let h

	onMount(() => {
        const renderer = new Renderer({
            width: w,
            height: h,
        });
        const gl = renderer.gl;
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
                float zoom = 1.4;
                float t = ((uTime*0.1)*zoom)/2.;
                vec2 uv = vUv;
                uv = (2.*uv) - vec2(1.);
                uv.x *= ${w/h};

                vec3 color = vec3(${color.r}./255., ${color.g}./255., ${color.b}./255.);
                vec3 accent_color = vec3(${accent.r}./255., ${accent.g}./255., ${accent.b}./255.);
                
                vec3 tangent = vec3(0.);
                float h = wave(uv, tangent, -t, PI/2. - PI*t/30., 0.3, 1.*zoom, 0.1)
                    + wave(uv, tangent, t, PI/3.5 - PI*t/30., 0.4, 0.4*zoom, 10.)
                    + wave(uv, tangent, t, PI/4. - PI*t/30., 0.8, 0.7*zoom, 2.)
                    + wave(uv, tangent, -t, PI/4.5 - PI*t/30., 1., 2.*zoom, 7.);

                vec3 n = vec3(-tangent.y, tangent.x, 0);
                
                vec3 p = vec3(uv.x, h, uv.y);
                vec3 lpos = vec3(cos(t)*1., 2., sin(t)*1.);
                float lam = smoothstep(0., 2., dot(n, normalize(lpos-p)));
                
                vec3 water = smoothstep(-1., 0.4, lam)*vec3(color*0.7);
                vec3 shiny = (vec3(smoothstep(0.9, 1., lam))*accent_color*0.1);
                
                gl_FragColor = vec4(water+shiny, 1.0);
            }`,
            uniforms: {
                uTime: {value: 0},
            },
        });

        const mesh = new Mesh(gl, {geometry, program});

        requestAnimationFrame(update);
        function update(t) {
            requestAnimationFrame(update);

            program.uniforms.uTime.value = t * 0.001;

            // Don't need a camera if camera uniforms aren't required
            renderer.render({scene: mesh});
        }
	})
</script>

<div id="content-div" bind:clientWidth={w} bind:clientHeight={h} class="content bg-gradient-to-tr from-primary-800 via-primary-700 to-primary-900"></div>

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
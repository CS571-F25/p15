import React, { useRef, useEffect } from "react";

// --- GLSL Shader Source ---
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;
uniform float u_fade;
uniform int u_from;
uniform int u_to;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_modA;
uniform vec4 u_modB;
uniform vec4 u_modC;
out vec4 out_color;

// Helper - run your shader core
vec4 core(vec4 params) {
    vec2 I = gl_FragCoord.xy;
    float t = u_time, z = 0.0, d = 0.0, s = 0.0;
    float i = 0.0;
    vec4 O = vec4(0.0);
    for(O*=i; i++<8e1; O+=(cos(s+params)+1.0)/d*z) {
        vec3 p = z*normalize(vec3(I+I,0.0)-vec3(u_resolution, u_resolution.y));
        vec3 a = normalize(cos(vec3(1,2,0)+t-d*8.0));
        p.z+=5.0;
        a = a*dot(a,p)-cross(a,p);

        for(d=1.0; d++<9.0;)
            a+=sin(a*d+t).yzx/d;

        z+=d=.1*abs(length(p)-3.0)+.04*abs(s=a.y);
    }
    return tanh(O/3e4);
}

void main() {
    vec4 colorA = core(u_modA);
    vec4 colorB = core(u_modB);
    vec4 colorC = core(u_modC);

    vec4 fromColor = (u_from == 0) ? colorA : (u_from == 1) ? colorB : colorC;
    vec4 toColor   = (u_to   == 0) ? colorA : (u_to   == 1) ? colorB : colorC;

    out_color = mix(fromColor, toColor, u_fade);
}

`;

const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// --- WebGL Utility Functions ---
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

function resizeCanvasToDisplaySize(canvas) {
  const { clientWidth, clientHeight } = canvas;
  if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
    canvas.width = clientWidth;
    canvas.height = clientHeight;
    return true;
  }
  return false;
}

// --- Main Shader Background Component ---

/**
 * Props:
 *   modA: vec4 array for shader A (e.g., [0,1,2,0])
 *   modB: vec4 array for shader B
 *   fade: float 0-1, controls crossfade
 */
export default function ShaderBackgroundCrossfade({
  modA = [0, 1, 2, 0],
  modB = [4, 1, 8, 2],
  fade = 0
}) {
  const canvasRef = useRef(null);
  // Use refs to ensure the latest values are visible to the render loop without recreating everything
  const fadeRef = useRef(fade);
  const modARef = useRef(modA);
  const modBRef = useRef(modB);

  useEffect(() => { fadeRef.current = fade; }, [fade]);
  useEffect(() => { modARef.current = modA; }, [modA]);
  useEffect(() => { modBRef.current = modB; }, [modB]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false });
    if (!gl) {
      console.warn("WebGL2 not supported in this browser.");
      return;
    }

    const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    if (!program) return;
    gl.useProgram(program);

    // Set up buffer/position
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1,  1, 1, -1, 1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const fadeLocation = gl.getUniformLocation(program, "u_fade");
    const modALocation = gl.getUniformLocation(program, "u_modA");
    const modBLocation = gl.getUniformLocation(program, "u_modB");

    let startTime = performance.now();
    let frameId;

    const render = (currentTime) => {
      const time = (currentTime - startTime) / 1000;
      resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(fadeLocation, fadeRef.current);
      gl.uniform4fv(modALocation, modARef.current);
      gl.uniform4fv(modBLocation, modBRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []); // only on mount!

  return (
    <canvas
      ref={canvasRef}
      className="gl-shader-canvas"
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        zIndex: -10, pointerEvents: "none"
      }}
      tabIndex={-1}
    />
  );
}

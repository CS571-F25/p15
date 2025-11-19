import React, { useRef, useEffect } from "react";

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;
uniform float u_fade;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_modA;
uniform vec4 u_modB;
out vec4 out_color;

vec4 core(vec4 params) {
    vec2 I = gl_FragCoord.xy;
    float t = u_time*0.1, z = 0.0, d = 0.0, s = 0.0;
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
    out_color = mix(colorA, colorB, u_fade);
}
`;

const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

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

export default function ShaderBackgroundDualCrossfade({
  modA = [0, 1, 2, 0],
  modB = [4, 1, 8, 2],
  fade = 0
}) {
  const canvasRef = useRef(null);
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

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
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
  }, []);

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

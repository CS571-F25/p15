import React, { useRef, useEffect } from 'react';

// -- GLSL Shader, uses u_modA as a uniform vec4 --
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_modA;  // Accepts the modA prop
out vec4 out_color;

void main() {
    vec2 I = gl_FragCoord.xy;
    float t = u_time*0.2, z = 0.0, d = 0.0, s = 0.0;
    float i = 0.0;
    vec4 O = vec4(0.0);

    for(O*=i; i++<8e1; O+=(cos(s+u_modA)+1.0)/d*z) {  // <--- uses uniform
        vec3 p = z * normalize(vec3(I+I,0.0)-vec3(u_resolution, u_resolution.y));
        vec3 a = normalize(cos(vec3(1,2,0)+t-d*8.0));
        p.z += 5.0;
        a = a * dot(a,p) - cross(a,p);

        for(d=1.0; d++<9.0;)
            a += sin(a*d+t).yzx/d;

        z += d = .1*abs(length(p)-3.0) + .04 * abs(s=a.y);
    }
    out_color = tanh(O/3e4);
}
`;

const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
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
    console.error('Program link error:', gl.getProgramInfoLog(program));
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

export default function ShaderBackground({ modA = [0, 1, 2, 0] }) {
  const canvasRef = useRef(null);
  const modARef = useRef(modA);

  // keep modARef in sync with latest prop
  useEffect(() => { modARef.current = modA; }, [modA]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { antialias: false });
    if (!gl) {
      console.warn('WebGL2 not supported in this browser.');
      return;
    }

    const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    if (!program) return;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const modALocation = gl.getUniformLocation(program, 'u_modA');

    let startTime = performance.now();
    let frameId;

    const render = (currentTime) => {
      const time = (currentTime - startTime) / 1000;
      resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform4fv(modALocation, modARef.current);
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

  return <canvas ref={canvasRef} className="gl-shader-canvas" />;
}

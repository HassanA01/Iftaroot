import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += sin(pos.x * 2.0 + uTime * 0.3) * 0.15;
    pos.z += cos(pos.y * 2.0 + uTime * 0.2) * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;

  vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x / 289.0) * 289.0; }
  vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405, 0.366025403784, -0.577350269189, 0.024390243902);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float n = snoise(vUv * 3.0 + uTime * 0.15);
    float n2 = snoise(vUv * 2.0 - uTime * 0.1);
    float n3 = snoise(vUv * 4.0 + uTime * 0.12);

    vec3 deepNavy   = vec3(0.024, 0.035, 0.102);  // #06091a
    vec3 richPurple = vec3(0.10, 0.04, 0.18);     // visible purple
    vec3 midPurple  = vec3(0.07, 0.02, 0.14);     // mid tone
    vec3 gold       = vec3(0.961, 0.784, 0.259);  // #f5c842

    vec3 color = mix(deepNavy, richPurple, smoothstep(-0.3, 0.5, n));
    color = mix(color, midPurple, smoothstep(-0.2, 0.6, n2));
    // Subtle gold shimmer that moves
    color += gold * smoothstep(0.4, 0.8, n * n2) * 0.05;
    // Add extra purple brightness in patches for visible movement
    color += richPurple * smoothstep(0.2, 0.7, n3) * 0.3;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function GradientMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]} scale={[20, 14, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

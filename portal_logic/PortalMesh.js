import * as THREE from 'three';

export class PortalMesh {
  constructor(renderTarget) {
    // Geometry can be a simple plane - shader handles projection
    // We make it slightly larger to ensure coverage if oblique clipping misses edge
    const geometry = new THREE.PlaneGeometry(2, 3);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        // STEP 1: The 'map' is the texture rendered by the virtual camera at the other portal
        map: { value: renderTarget.texture },
        // STEP 2: 'resolution' helps us map pixels to screen coordinates correctly
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        // STEP 3: 'brightnessBoost' prevents the portal from looking too dark (compensates for light loss)
        brightnessBoost: { value: 2.5 }
      },
      vertexShader: `
        varying vec4 vClipPosition;
        void main() {
          // Standard projection: positions the portal on the wall in the 3D world
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vClipPosition = gl_Position;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec2 resolution;
        uniform float brightnessBoost;
        
        void main() {
          // STEP 4: Calculate where this pixel is on the user's screen (from 0 to 1)
          // This makes the portal look like a "window" instead of a flat sticker
          vec2 screenUV = gl_FragCoord.xy / resolution;
          
          // STEP 5: Grab the color from the other portal's camera view at this screen position
          vec4 color = texture2D(map, screenUV);
          
          // STEP 6: Apply the brightness boost and output the final pixel color
          // We don't use standard lighting here because the portal is "emissive" (it shows another world)
          gl_FragColor = vec4(color.rgb * brightnessBoost, color.a);
        }
      `
    });

    // Stencil configuration
    material.stencilWrite = true;
    material.stencilFunc = THREE.EqualStencilFunc;
    material.stencilRef = 1;
    material.stencilFail = THREE.KeepStencilOp;
    material.stencilZFail = THREE.KeepStencilOp;
    material.stencilZPass = THREE.KeepStencilOp;
    material.side = THREE.DoubleSide;

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.renderOrder = 0; // Render after mask
  }

  setPositionAndOrientation(position, normal) {
    this.mesh.position.copy(position);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.mesh.quaternion.copy(quaternion);

    // Offset
    const offset = normal.clone().multiplyScalar(0.02);
    this.mesh.position.add(offset);
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  // Update resolution uniform
  setSize(width, height) {
    this.mesh.material.uniforms.resolution.value.set(width, height);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
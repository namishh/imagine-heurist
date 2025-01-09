import { filters } from 'fabric';
import type { T2DPipelineState, TWebGLUniformLocationMap } from 'fabric';

type CRTFilterProps = {
  curvature: number;
  lineWidth: number;
  lineContrast: number;
  noise: number;
  flicker: number;
  bezelWidth: number;
  bezelColor: string;
};

export const crtFilterDefaults: CRTFilterProps = {
  curvature: 0.5,
  lineWidth: 0.5,
  lineContrast: 0.3,
  noise: 0.2,
  flicker: 0.1,
  bezelWidth: 0.1,
  bezelColor: '#000000',
};

export class CRTFilter extends filters.BaseFilter<'CRT', CRTFilterProps> {
  declare curvature: CRTFilterProps['curvature'];
  declare lineWidth: CRTFilterProps['lineWidth'];
  declare lineContrast: CRTFilterProps['lineContrast'];
  declare noise: CRTFilterProps['noise'];
  declare flicker: CRTFilterProps['flicker'];
  declare bezelWidth: CRTFilterProps['bezelWidth'];
  declare bezelColor: CRTFilterProps['bezelColor'];

  static type = 'CRT';
  static defaults = crtFilterDefaults;
  static uniformLocations = [
    'uCurvature',
    'uLineWidth',
    'uLineContrast',
    'uNoise',
    'uFlicker',
    'uTime',
    'uBezelWidth',
    'uBezelColor',
  ];

  getFragmentSource() {
    return `
      precision highp float;
      uniform sampler2D uTexture;
      uniform float uCurvature;
      uniform float uLineWidth;
      uniform float uLineContrast;
      uniform float uNoise;
      uniform float uFlicker;
      uniform float uTime;
      uniform float uBezelWidth;
      uniform vec3 uBezelColor;
      varying vec2 vTexCoord;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec2 coord = vTexCoord;
        
        float bezelLeft = step(coord.x, uBezelWidth);
        float bezelRight = step(1.0 - uBezelWidth, coord.x);
        float bezelTop = step(coord.y, uBezelWidth);
        float bezelBottom = step(1.0 - uBezelWidth, coord.y);
        float isBezel = max(max(bezelLeft, bezelRight), max(bezelTop, bezelBottom));
        
        if (isBezel > 0.0) {
          gl_FragColor = vec4(uBezelColor, 1.0);
          return;
        }
        
        coord = (coord - vec2(uBezelWidth)) / (1.0 - 2.0 * uBezelWidth);
        
        vec2 curved = coord * 2.0 - 1.0;
        float dist = length(curved);
        coord = coord + curved * (dist * dist * uCurvature);
        
        if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
          gl_FragColor = vec4(uBezelColor, 1.0);
          return;
        }

        float scanline = sin(coord.y * 800.0 * uLineWidth) * uLineContrast;
        
        float noise = rand(coord + uTime) * uNoise;
        
        float flicker = sin(uTime * 10.0) * uFlicker;

        vec4 color = texture2D(uTexture, coord);
        
        color.rgb += scanline;
        color.rgb += noise;
        color.rgb += flicker;
        
        float shift = sin(uTime) * 0.001;
        color.r = texture2D(uTexture, coord + vec2(shift, 0.0)).r;
        color.b = texture2D(uTexture, coord - vec2(shift, 0.0)).b;

        gl_FragColor = color;
      }
    `;
  }

  applyTo2d(options: T2DPipelineState) {
    const imageData = options.imageData.data;
    const time = Date.now() * 0.001;
    const width = options.sourceWidth;
    const height = options.sourceHeight;
    const bezelPixels = Math.round(width * this.bezelWidth);
    
    // Parse bezel color
    const bezelColor = {
      r: parseInt(this.bezelColor.slice(1, 3), 16),
      g: parseInt(this.bezelColor.slice(3, 5), 16),
      b: parseInt(this.bezelColor.slice(5, 7), 16),
    };

    for (let i = 0; i < imageData.length; i += 4) {
      const y = Math.floor(i / 4 / width);
      const x = (i / 4) % width;

      // Check if pixel is in bezel
      if (x < bezelPixels || x >= width - bezelPixels ||
          y < bezelPixels || y >= height - bezelPixels) {
        imageData[i] = bezelColor.r;
        imageData[i + 1] = bezelColor.g;
        imageData[i + 2] = bezelColor.b;
        continue;
      }

      const scanline = Math.sin(y * this.lineWidth * 0.1) * this.lineContrast * 30;
      const noise = (Math.random() - 0.5) * this.noise * 50;
      const flicker = Math.sin(time * 10) * this.flicker * 20;

      imageData[i] += scanline + noise + flicker;
      imageData[i + 1] += scanline + noise + flicker;
      imageData[i + 2] += scanline + noise + flicker;
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ) {
    gl.uniform1f(uniformLocations.uCurvature, this.curvature);
    gl.uniform1f(uniformLocations.uLineWidth, this.lineWidth);
    gl.uniform1f(uniformLocations.uLineContrast, this.lineContrast);
    gl.uniform1f(uniformLocations.uNoise, this.noise);
    gl.uniform1f(uniformLocations.uFlicker, this.flicker);
    gl.uniform1f(uniformLocations.uTime, Date.now() * 0.001);
    gl.uniform1f(uniformLocations.uBezelWidth, this.bezelWidth);
    
    // Convert hex color to RGB
    const r = parseInt(this.bezelColor.slice(1, 3), 16) / 255;
    const g = parseInt(this.bezelColor.slice(3, 5), 16) / 255;
    const b = parseInt(this.bezelColor.slice(5, 7), 16) / 255;
    gl.uniform3f(uniformLocations.uBezelColor, r, g, b);
  }
}


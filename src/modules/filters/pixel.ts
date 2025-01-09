import { filters } from 'fabric';
import type { T2DPipelineState, TWebGLUniformLocationMap } from 'fabric';

type PixelFilterProps = {
  blockSize: number;
  smoothing: number;
};

export const pixelFilterDefaults: PixelFilterProps = {
  blockSize: 8,     // Size of pixel blocks
  smoothing: 0.0,   // Amount of smoothing between blocks (0 = sharp, 1 = smooth)
};

export class PixelFilter extends filters.BaseFilter<'Pixel', PixelFilterProps> {
  declare blockSize: PixelFilterProps['blockSize'];
  declare smoothing: PixelFilterProps['smoothing'];

  static type = 'Pixel';
  static defaults = pixelFilterDefaults;
  static uniformLocations = ['uBlockSize', 'uSmoothing', 'uImageSize'];

  getFragmentSource() {
    return `
      precision highp float;
      uniform sampler2D uTexture;
      uniform float uBlockSize;
      uniform float uSmoothing;
      uniform vec2 uImageSize;
      varying vec2 vTexCoord;

      void main() {
        vec2 blocks = uImageSize / uBlockSize;
        
        // Calculate the block position
        vec2 blockPos = floor(vTexCoord * blocks) / blocks;
        
        if (uSmoothing > 0.0) {
          // Smooth transition between blocks
          vec2 blockCenter = blockPos + (0.5 / blocks);
          vec2 fractional = fract(vTexCoord * blocks);
          
          // Calculate smoothing factor
          vec2 smoothStep = smoothstep(
            vec2(0.0),
            vec2(uSmoothing),
            fractional
          ) * (1.0 - smoothstep(
            vec2(1.0 - uSmoothing),
            vec2(1.0),
            fractional
          ));
          
          // Sample four adjacent blocks
          vec4 color1 = texture2D(uTexture, blockPos);
          vec4 color2 = texture2D(uTexture, blockPos + vec2(1.0 / blocks.x, 0.0));
          vec4 color3 = texture2D(uTexture, blockPos + vec2(0.0, 1.0 / blocks.y));
          vec4 color4 = texture2D(uTexture, blockPos + vec2(1.0 / blocks.x, 1.0 / blocks.y));
          
          // Blend between blocks
          vec4 color = mix(
            mix(color1, color2, smoothStep.x),
            mix(color3, color4, smoothStep.x),
            smoothStep.y
          );
          
          gl_FragColor = color;
        } else {
          // Sharp pixelation
          gl_FragColor = texture2D(uTexture, blockPos);
        }
      }
    `;
  }

  applyTo2d(options: T2DPipelineState) {
    const imageData = options.imageData.data;
    const width = options.sourceWidth;
    const height = options.sourceHeight;
    
    // Create temporary canvas for block processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Draw original image data
    const tempImageData = tempCtx.createImageData(width, height);
    tempImageData.data.set(imageData);
    tempCtx.putImageData(tempImageData, 0, 0);
    
    // Process blocks
    for (let y = 0; y < height; y += this.blockSize) {
      for (let x = 0; x < width; x += this.blockSize) {
        const blockWidth = Math.min(this.blockSize, width - x);
        const blockHeight = Math.min(this.blockSize, height - y);
        
        // Calculate average color for block
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;
        
        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const i = ((y + by) * width + (x + bx)) * 4;
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            a += imageData[i + 3];
            count++;
          }
        }
        
        // Apply average color to block
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);
        
        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const i = ((y + by) * width + (x + bx)) * 4;
            imageData[i] = r;
            imageData[i + 1] = g;
            imageData[i + 2] = b;
            imageData[i + 3] = a;
          }
        }
      }
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ) {
    gl.uniform1f(uniformLocations.uBlockSize, Math.max(1, this.blockSize));
    gl.uniform1f(uniformLocations.uSmoothing, Math.max(0, Math.min(1, this.smoothing)));
    gl.uniform2f(
      uniformLocations.uImageSize,
      gl.canvas?.width || 0,
      gl.canvas?.height || 0
    );
  }
}
import * as THREE from 'three';

/**
 * Wraps the Three.js scene/renderer/animation-loop lifecycle behind a
 * small interface so `presentation-*` never imports Three.js directly.
 * Scene content, camera setup, and the render loop are implemented in a
 * later plan — this class only establishes the wiring point.
 */
export class ThreeSceneEngine {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;

  init(_canvas: HTMLCanvasElement): void {
    // Intentionally empty: real scene/camera/renderer setup and the
    // animation loop are implemented in a later plan.
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.renderer?.dispose();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }
}

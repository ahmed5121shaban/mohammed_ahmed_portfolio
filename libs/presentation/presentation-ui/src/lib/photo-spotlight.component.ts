import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * A grayscale photo with a color "spotlight" that follows the cursor —
 * a radial mask reveals the full-color layer underneath a fine-pointer's
 * hover position. Falls back to a static grayscale image on touch/SSR.
 */
@Component({
  selector: 'pf-photo-spotlight',
  standalone: true,
  template: `
    <div #box class="pf-photo-box">
      <div class="pf-photo-gray"><img [src]="src" [alt]="alt" /></div>
      <img class="pf-photo-color" [src]="src" alt="" aria-hidden="true" #colorLayer />
    </div>
  `,
  styles: `
    :host { display: block; cursor: crosshair; }
    .pf-photo-box {
      position: relative;
      border: 2px solid var(--color-text);
      overflow: hidden;
    }
    .pf-photo-gray {
      filter: grayscale(1) contrast(1.08);
    }
    .pf-photo-gray img {
      width: 100%;
      display: block;
    }
    .pf-photo-color {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
      -webkit-mask-image: radial-gradient(circle 0px at 50% 50%, #000 62%, transparent 100%);
      mask-image: radial-gradient(circle 0px at 50% 50%, #000 62%, transparent 100%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoSpotlightComponent implements OnDestroy {
  @Input({ required: true }) src = '';
  @Input({ required: true }) alt = '';

  @ViewChild('box', { static: true }) boxRef!: ElementRef<HTMLElement>;
  @ViewChild('colorLayer', { static: true }) colorLayerRef!: ElementRef<HTMLImageElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private frameId?: number;
  private onMove?: (e: MouseEvent) => void;
  private onLeave?: () => void;

  constructor() {
    afterNextRender(() => this.boot());
  }

  private boot(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!window.matchMedia('(pointer:fine)').matches) {
      return;
    }
    const box = this.boxRef.nativeElement;
    const layer = this.colorLayerRef.nativeElement;
    let px = 0;
    let py = 0;
    let radius = 0;
    let wantRadius = 0;
    let ticking = false;

    const paint = () => {
      const gradient = `radial-gradient(circle ${radius.toFixed(1)}px at ${px.toFixed(1)}px ${py.toFixed(1)}px, #000 62%, transparent 100%)`;
      layer.style.webkitMaskImage = gradient;
      layer.style.maskImage = gradient;
    };
    const tick = () => {
      radius += (wantRadius - radius) * 0.16;
      paint();
      if (Math.abs(wantRadius - radius) > 0.4) {
        this.frameId = requestAnimationFrame(tick);
      } else {
        radius = wantRadius;
        paint();
        ticking = false;
      }
    };
    const kick = () => {
      if (!ticking) {
        ticking = true;
        this.frameId = requestAnimationFrame(tick);
      }
    };

    this.onMove = (e: MouseEvent) => {
      const rect = box.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      wantRadius = Math.max(96, Math.min(rect.width, rect.height) * 0.42);
      if (radius < 1) {
        radius = 1;
      }
      paint();
      kick();
    };
    this.onLeave = () => {
      wantRadius = 0;
      kick();
    };
    box.addEventListener('mousemove', this.onMove, { passive: true });
    box.addEventListener('mouseleave', this.onLeave);
  }

  ngOnDestroy(): void {
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }
    const box = this.boxRef?.nativeElement;
    if (box && this.onMove) {
      box.removeEventListener('mousemove', this.onMove);
    }
    if (box && this.onLeave) {
      box.removeEventListener('mouseleave', this.onLeave);
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * A small ring that trails the mouse cursor with easing, enlarging over
 * interactive elements. Only activates on fine-pointer (mouse) devices,
 * and never runs during SSR.
 */
@Component({
  selector: 'pf-cursor-follower',
  standalone: true,
  template: '',
  styles: `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 26px;
      height: 26px;
      border: 2px solid var(--color-accent);
      pointer-events: none;
      z-index: 70;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s, width 0.18s, height 0.18s, background 0.18s;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursorFollowerComponent implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private frameId?: number;
  private onMove?: (e: MouseEvent) => void;

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
    const node = this.el.nativeElement;
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let started = false;

    this.onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!started) {
        started = true;
        cx = x;
        cy = y;
        node.style.opacity = '1';
      }
      const target = e.target as HTMLElement | null;
      const hot = target?.closest('a, button, [data-map-btn], [data-flip], [data-hover]');
      node.style.width = hot ? '46px' : '26px';
      node.style.height = hot ? '46px' : '26px';
      node.style.background = hot
        ? 'color-mix(in srgb, var(--color-accent) 18%, transparent)'
        : 'transparent';
    };
    window.addEventListener('mousemove', this.onMove, { passive: true });

    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      node.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      this.frameId = requestAnimationFrame(loop);
    };
    this.frameId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.onMove) {
      window.removeEventListener('mousemove', this.onMove);
    }
  }
}

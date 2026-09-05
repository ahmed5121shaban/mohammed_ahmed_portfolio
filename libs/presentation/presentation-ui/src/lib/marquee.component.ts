import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * An infinitely-scrolling strip of labels, separated by a diamond glyph,
 * that pauses on hover. The list is duplicated once so the CSS animation
 * (translateX 0 → -50%) loops seamlessly.
 */
@Component({
  selector: 'pf-marquee',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pf-marquee-track">
      <div class="pf-marquee-row" aria-hidden="false">
        @for (item of items; track $index) {
          <span>{{ item }}</span>
          <span class="pf-marquee-dot">◼</span>
        }
      </div>
      <div class="pf-marquee-row" aria-hidden="true">
        @for (item of items; track $index) {
          <span>{{ item }}</span>
          <span class="pf-marquee-dot">◼</span>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      border-top: 2px solid var(--color-divider);
      border-bottom: 2px solid var(--color-divider);
      padding: 14px 0;
      background: var(--color-surface);
    }
    .pf-marquee-track {
      display: flex;
      width: max-content;
      animation: pf-marq 46s linear infinite;
    }
    :host:hover .pf-marquee-track {
      animation-play-state: paused;
    }
    .pf-marquee-row {
      display: flex;
      gap: 36px;
      padding-inline-end: 36px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-neutral-800);
      white-space: nowrap;
    }
    .pf-marquee-dot {
      color: var(--color-accent);
    }
    @keyframes pf-marq {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
  `,
})
export class MarqueeComponent {
  @Input({ required: true }) items: string[] = [];
}

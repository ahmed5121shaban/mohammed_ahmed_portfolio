import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * An infinitely-scrolling strip of labels, separated by a diamond glyph.
 * The list is duplicated once so the CSS animation (translateX 0 → -50%)
 * loops seamlessly. Deliberately does NOT pause on hover — the band spans
 * the full page width, so a hover-to-pause rule here means any resting
 * cursor position (e.g. after a wheel-scroll) freezes it indefinitely.
 */
@Component({
  selector: 'pf-marquee',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pf-marquee-track" style="direction: ltr;">
      <div class="pf-marquee-row" aria-hidden="false" style="direction: ltr;">
        @for (item of items; track $index) {
          <span>{{ item }}</span>
          <span class="pf-marquee-dot">◼</span>
        }
      </div>
      <div class="pf-marquee-row" aria-hidden="true" style="direction: ltr;">
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
      direction: rtl;
    }
    .pf-marquee-track {
      display: flex;
      width: max-content;
      animation: pf-marq 46s linear infinite;
      direction: rtl;
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

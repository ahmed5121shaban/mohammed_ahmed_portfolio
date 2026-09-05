import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Fades an element in and slides it up once it scrolls into view.
 * Mirrors the reference design's `[data-reveal]` behavior: elements
 * already on screen at boot are shown immediately (no observer wait),
 * and a small stagger delay can be set per element via `pfRevealIndex`.
 */
@Directive({
  selector: '[pfReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  /** Position among sibling revealed elements — staggers the entrance. */
  @Input() pfRevealIndex = 0;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const node = this.el.nativeElement;
    const delay = Math.min(this.pfRevealIndex, 4) * 70;
    const distance = 32;
    const duration = 0.8;
    const ease = 'cubic-bezier(.22,.75,.15,1)';

    node.style.transition = `opacity ${duration}s ${ease}, transform ${duration}s ${ease}`;

    const rect = node.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.9) {
      node.style.opacity = '0';
      node.style.transform = `translateY(${distance}px)`;
    }

    const show = () => {
      node.style.opacity = '1';
      node.style.transform = 'none';
    };

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(show, delay);
            this.observer?.unobserve(node);
          }
        }
      },
      { threshold: 0.04, rootMargin: '0px 0px -6% 0px' },
    );
    this.observer.observe(node);

    // Safety net: never leave content permanently hidden.
    setTimeout(show, 8000);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

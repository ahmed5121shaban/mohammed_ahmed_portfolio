import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { ProfileFacade } from '@kola-profile/application';
import {
  CounterComponent,
  CursorFollowerComponent,
  MarqueeComponent,
  PhotoSpotlightComponent,
  ProgressBarComponent,
  RevealDirective,
} from '@kola-profile/presentation-ui';
import { SectionAnchorDirective } from './section-anchor.directive';

interface RailLink {
  title: string;
  el: HTMLElement;
  active: boolean;
}

/**
 * The full profile/portfolio page — a faithful port of the reference
 * "Interactive Arabic portfolio website" design. Composes the reusable
 * pieces from `presentation-ui` with content from `application`'s
 * `ProfileFacade`, and owns the page-specific interactions (scroll rail,
 * region switcher, certificate filter, intro curtain, hero entrance).
 */
@Component({
  selector: 'app-profile-shell',
  standalone: true,
  imports: [
    CommonModule,
    RevealDirective,
    CounterComponent,
    MarqueeComponent,
    CursorFollowerComponent,
    PhotoSpotlightComponent,
    ProgressBarComponent,
    SectionAnchorDirective,
  ],
  templateUrl: './profile-shell.component.html',
  styleUrl: './profile-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileShellComponent implements AfterViewInit, OnDestroy {
  private readonly facade = inject(ProfileFacade);
  private readonly platformId = inject(PLATFORM_ID);

  readonly profile = this.facade.profile;

  readonly showIntroCurtain = signal(true);
  readonly introCurtainHiding = signal(false);
  readonly activeRegion = signal('aswan');
  readonly activeCertFilter = signal('all');
  readonly showRail = signal(false);
  readonly railLinks = signal<RailLink[]>([]);

  @ViewChildren(SectionAnchorDirective) private sectionAnchors!: QueryList<SectionAnchorDirective>;
  @ViewChildren('maskLine') private maskLines!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('growRule') private growRule?: ElementRef<HTMLElement>;

  private onScroll?: () => void;
  private onResize?: () => void;

  constructor() {
    afterNextRender(() => this.playIntroSequence());
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.setupRail();
  }

  ngOnDestroy(): void {
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll);
    }
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  setRegion(key: string): void {
    this.activeRegion.set(key);
  }

  setCertFilter(year: string): void {
    this.activeCertFilter.set(year);
  }

  certVisible(filterYear: string): boolean {
    return this.activeCertFilter() === 'all' || this.activeCertFilter() === filterYear;
  }

  scrollToSection(el: HTMLElement): void {
    const top = el.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  printResume(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  // ── intro curtain + hero mask entrance ──────────────────────────────
  private playIntroSequence(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const introDelay = 1000;
    const ease = 'cubic-bezier(.22,.75,.15,1)';

    // Mask lines start translated below their line box; the accent rule
    // starts collapsed — both animate in together after the curtain lifts.
    const masks = this.maskLines?.toArray() ?? [];
    masks.forEach((ref) => {
      const node = ref.nativeElement;
      node.style.transform = 'translateY(108%)';
      node.style.transition = `transform .95s ${ease}`;
    });
    const rule = this.growRule?.nativeElement;
    if (rule) {
      rule.style.transform = 'scaleX(0)';
      rule.style.transformOrigin = 'right center';
      rule.style.transition = `transform 1.1s ${ease}`;
    }

    setTimeout(() => {
      masks.forEach((ref, i) => {
        setTimeout(() => {
          ref.nativeElement.style.transform = 'none';
        }, i * 110);
      });
      if (rule) {
        setTimeout(() => {
          rule.style.transform = 'none';
        }, 240);
      }
    }, introDelay);

    // Curtain: slide up and remove after the intro delay.
    setTimeout(() => this.introCurtainHiding.set(true), 950);
    setTimeout(() => this.showIntroCurtain.set(false), 1900);
  }

  // ── scroll rail / progress nav ──────────────────────────────────────
  private setupRail(): void {
    const links: RailLink[] = this.sectionAnchors
      .toArray()
      .map((anchor) => ({ title: anchor.title, el: anchor.el.nativeElement, active: false }));
    this.railLinks.set(links);

    const updateRailVisibility = () => this.showRail.set(window.innerWidth >= 1180);
    const updateActive = () => {
      let activeIndex = -1;
      links.forEach((link, i) => {
        if (link.el.getBoundingClientRect().top <= window.innerHeight * 0.34) {
          activeIndex = i;
        }
      });
      this.railLinks.set(links.map((link, i) => ({ ...link, active: i === activeIndex })));
    };

    this.onScroll = updateActive;
    this.onResize = () => {
      updateRailVisibility();
      updateActive();
    };
    updateRailVisibility();
    updateActive();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);
  }
}

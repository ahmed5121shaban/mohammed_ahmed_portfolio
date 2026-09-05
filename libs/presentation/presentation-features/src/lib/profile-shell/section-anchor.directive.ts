import { Directive, ElementRef, Input, inject } from '@angular/core';

/**
 * Marks a `<section>` as a stop for the scroll rail / progress nav.
 * Page-local to `ProfileShellComponent` — not exported from the lib's
 * public barrel.
 */
@Directive({
  selector: '[appSectionAnchor]',
  standalone: true,
})
export class SectionAnchorDirective {
  @Input('appSectionAnchor') title = '';
  readonly el = inject(ElementRef<HTMLElement>);
}

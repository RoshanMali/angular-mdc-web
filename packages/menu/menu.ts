import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { Platform, toBoolean, toNumber } from '@angular-mdc/web/common';
import { MdcList, MdcListItem } from '@angular-mdc/web/list';
import {
  AbsolutePosition,
  Anchor,
  AnchorMargin,
  MdcMenuSurfaceAnchor,
  MdcMenuSurfaceBase,
  MdcMenuSurfaceOpenedEvent
} from '@angular-mdc/web/menu-surface';

import { MDCMenuFoundation, Corner } from '@material/menu/index';

export class MdcMenuSelectedEvent {
  constructor(
    public index: number,
    public source: MdcListItem) { }
}

let nextUniqueId = 0;

@Component({
  moduleId: module.id,
  selector: '[mdcMenuSelectionGroup], mdc-menu-selection-group',
  host: {
    'class': 'mdc-menu__selection-group'
  },
  exportAs: 'mdcMenuSelectionGroup',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None
})
export class MdcMenuSelectionGroup {
  constructor(public elementRef: ElementRef) { }
}

@Component({
  moduleId: module.id,
  selector: '[mdcMenuSelectionGroupIcon], mdc-menu-selection-group-icon',
  host: {
    'class': 'mdc-menu__selection-group-icon'
  },
  exportAs: 'mdcMenuSelectionGroupIcon',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None
})
export class MdcMenuSelectionGroupIcon {
  constructor(public elementRef: ElementRef<HTMLElement>) { }
}

@Component({
  moduleId: module.id,
  selector: 'mdc-menu',
  exportAs: 'mdcMenu',
  host: {
    '[id]': 'id',
    '[tabIndex]': 'tabIndex',
    'class': 'mdc-menu',
    '[class.mdc-menu-surface]': 'true',
    '(click)': 'menuClick($event)',
    '(keydown)': 'menuKeydown($event)',
  },
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdcMenu extends MdcMenuSurfaceBase implements AfterContentInit, OnDestroy {
  private _uniqueId: string = `mdc-menu-${++nextUniqueId}`;

  @Input() id: string = this._uniqueId;

  @Input()
  get open(): boolean { return this.isOpen(); }
  set open(value: boolean) {
    this._open = toBoolean(value);
    this.setOpen(this._open);
    this._changeDetectorRef.markForCheck();
  }
  private _open: boolean;

  @Input()
  get anchor(): any { return this._anchor; }
  set anchor(element: any) {
    this._anchor = element;
    this.setMenuSurfaceAnchorElement(element);
  }
  private _anchor: any;

  @Input()
  get anchorCorner(): Anchor { return this._anchorCorner; }
  set anchorCorner(value: Anchor) {
    this._anchorCorner = value;
    this.setAnchorCorner(value);
    this._changeDetectorRef.markForCheck();
  }
  private _anchorCorner: Anchor;

  @Input()
  get quickOpen(): boolean { return this._quickOpen; }
  set quickOpen(value: boolean) {
    this._quickOpen = toBoolean(value);
    this.setQuickOpen(this._quickOpen);
    this._changeDetectorRef.markForCheck();
  }
  private _quickOpen: boolean;

  @Input()
  get fixed(): boolean { return this._fixed; }
  set fixed(value: boolean) {
    this._fixed = toBoolean(value);
    this.setFixedPosition(this._fixed);
    this._changeDetectorRef.markForCheck();
  }
  private _fixed: boolean;

  @Input()
  get hoistToBody(): boolean { return this._hoistToBody; }
  set hoistToBody(value: boolean) {
    this._hoistToBody = toBoolean(value);
    if (this._hoistToBody) {
      this.setHoistMenuToBody();
    }
    this.setIsHoisted(this._hoistToBody);
    this._changeDetectorRef.markForCheck();
  }
  private _hoistToBody: boolean;

  @Input()
  get anchorMargin(): AnchorMargin { return this._anchorMargin; }
  set anchorMargin(value: AnchorMargin) {
    this._anchorMargin = value;
    this.setAnchorMargin(this._anchorMargin);
    this._changeDetectorRef.markForCheck();
  }
  private _anchorMargin: AnchorMargin;

  @Input()
  get absolutePosition(): AbsolutePosition { return this._absolutePosition; }
  set absolutePosition(value: AbsolutePosition) {
    this._absolutePosition = value;
    this.setAbsolutePosition(toNumber(value.x), toNumber(value.y));
    this._changeDetectorRef.markForCheck();
  }
  private _absolutePosition: AbsolutePosition;

  /** Tabindex of the menu. */
  @Input() tabIndex: number = -1;

  @Output() readonly selected: EventEmitter<MdcMenuSelectedEvent> =
    new EventEmitter<MdcMenuSelectedEvent>();

  @ContentChild(MdcList) _list: MdcList;
  @ContentChildren(MdcListItem, { descendants: true }) _listItems: QueryList<MdcListItem>;

  private _openedSubscription: Subscription;
  private _closedSubscription: Subscription;

  /** Subscription to changes in list items. */
  private _changeSubscription: Subscription;

  createAdapter() {
    return {
      addClassToElementAtIndex: (index: number, className: string) =>
        this._listItems.toArray()[index].getListItemElement().classList.add(className),
      removeClassFromElementAtIndex: (index: number, className: string) =>
        this._listItems.toArray()[index].getListItemElement().classList.remove(className),
      addAttributeToElementAtIndex: (index: number, attr: string, value: string) =>
        this._listItems.toArray()[index].getListItemElement().setAttribute(attr, value),
      removeAttributeFromElementAtIndex: (index: number, attr: string) =>
        this._listItems.toArray()[index].getListItemElement().removeAttribute(attr),
      elementContainsClass: (element: HTMLElement, className: string) => element.classList.contains(className),
      closeSurface: () => this.setOpen(false),
      getElementIndex: (element: HTMLElement) => this._listItems.toArray().findIndex(_ => _.getListItemElement() === element),
      getParentElement: (element: HTMLElement) => element.parentElement,
      getSelectedElementIndex: (selectionGroup: MdcMenuSelectionGroup) => {
        return this._listItems.toArray().indexOf(selectionGroup.elementRef.nativeElement.querySelector('mdc-menu-item--selected'));
      },
      notifySelected: (evtData: { index: number }) =>
        this.selected.emit(new MdcMenuSelectedEvent(evtData.index, this._listItems.toArray()[evtData.index]))
    };
  }

  private _menuFoundation: {
    destroy(): void,
    handleKeydown(evt: KeyboardEvent): void,
    handleClick(evt: MouseEvent): void
  } = new MDCMenuFoundation(this.createAdapter());

  constructor(
    protected platform: Platform,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected ngZone: NgZone,
    public elementRef: ElementRef<HTMLElement>) {

    super(platform, ngZone, elementRef);
  }

  ngAfterContentInit(): void {
    this._initList();

    // When the list items change, re-subscribe
    this._changeSubscription = this._listItems.changes.pipe(startWith(null)).subscribe(() => {
      this._listItems.forEach(item => item.setRole('menuitem'));
    });

    this._openedSubscription = this.opened.subscribe(() => {
      this.registerBodyCick();

      if (this._list) {
        this._list.focusFirstElement();
      }
    });

    this._closedSubscription = this.closed.subscribe(() => {
      this.deregisterBodyClick();
    });

    this.initMenuSurface();
  }

  ngOnDestroy(): void {
    if (this._changeSubscription) {
      this._changeSubscription.unsubscribe();
    }
    if (this._openedSubscription) {
      this._openedSubscription.unsubscribe();
    }
    if (this._closedSubscription) {
      this._closedSubscription.unsubscribe();
    }

    this.destroyMenuSurface();
    this._menuFoundation.destroy();
  }

  private _initList(): void {
    if (!this._list) { return; }

    this._list.setRole('menu');
    this._list.wrapFocus = true;
  }

  menuClick(evt: MouseEvent): void {
    this._menuFoundation.handleClick(evt);
  }

  menuKeydown(evt: KeyboardEvent): void {
    this._menuFoundation.handleKeydown(evt);
  }

  focus(): void {
    this._getHostElement().focus();
  }
}

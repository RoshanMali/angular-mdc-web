import { Component, DebugElement, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { dispatchFakeEvent, dispatchKeyboardEvent } from '../testing/dispatch-events';

import {
  LEFT_ARROW,
  MdcTabBarModule,
  MdcIconModule,
  MdcTabBar,
  MdcTab,
  MdcTabIndicator,
  MdcTabScrollerAlignment
} from '@angular-mdc/web';

describe('MDC Tabs', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdcTabBarModule, MdcIconModule],
      declarations: [SimpleTest]
    });
    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let testDebugElement: DebugElement;
    let testNativeElement: HTMLElement;
    let testInstance: MdcTabBar;
    let testComponent: SimpleTest;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTest);
      fixture.detectChanges();

      testDebugElement = fixture.debugElement.query(By.directive(MdcTabBar));
      testNativeElement = testDebugElement.nativeElement;
      testInstance = testDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('#should have mdc-tab-bar by default', () => {
      expect(testDebugElement.nativeElement.classList).toContain('mdc-tab-bar');
    });

    it('#should make second tab active', fakeAsync(() => {
      dispatchFakeEvent(testInstance.tabs.toArray()[1].elementRef.nativeElement, 'click');
      fixture.detectChanges();
      flush();
    }));

    it('#should make third tab active', fakeAsync(() => {
      dispatchFakeEvent(testInstance.tabs.toArray()[1].elementRef.nativeElement, 'click');
      fixture.detectChanges();
      flush();

      dispatchFakeEvent(testInstance.tabs.toArray()[2].elementRef.nativeElement, 'click');
      fixture.detectChanges();
      flush();
    }));

    it('#should handle keydown', fakeAsync(() => {
      dispatchKeyboardEvent(testInstance.tabs.toArray()[1].elementRef.nativeElement, 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      flush();
    }));

    it('#should make first tab active', fakeAsync(() => {
      testInstance.activateTab(0);
      fixture.detectChanges();
      flush();

      expect(testInstance.tabs.toArray()[0].elementRef.nativeElement.classList.contains('mdc-tab--active')).toBe(true);
    }));

    it('#should make first tab disabled', fakeAsync(() => {
      testInstance.disableTab(0, true);
      fixture.detectChanges();
      flush();

      expect(testInstance.tabs.toArray()[0].elementRef.nativeElement.classList.contains('ng-mdc-tab--disabled')).toBe(true);
    }));

    it('#should turn on stacked for tabs', fakeAsync(() => {
      testComponent.stacked = true;
      fixture.detectChanges();
      flush();
      expect(testInstance.tabs.toArray()[0].stacked).toBe(true);
    }));

    it('#should turn on fixed for tabs', fakeAsync(() => {
      testComponent.fixed = true;
      fixture.detectChanges();
      flush();
      expect(testInstance.tabs.toArray()[0].fixed).toBe(true);
    }));

    it('#should turn on fade indicator', fakeAsync(() => {
      testComponent.fade = true;
      fixture.detectChanges();
      flush();
      expect(testInstance.tabs.toArray()[0].tabIndicator.fade).toBe(true);
    }));

    it('#should turn on automatic activation behavior', fakeAsync(() => {
      testComponent.useAutomaticActivation = true;
      fixture.detectChanges();
      flush();
      expect(testInstance.useAutomaticActivation).toBe(true);
    }));

    it('#should set active tab', fakeAsync(() => {
      testComponent.activeTabIndex = 1;
      fixture.detectChanges();
      flush();
      expect(testInstance.getActiveTabIndex()).toBe(1);
      expect(testInstance.getActiveTab()).toBeDefined();
    }));

    it('#should set alignment to end', fakeAsync(() => {
      testComponent.align = 'end';
      fixture.detectChanges();
      flush();
      expect(testInstance.tabScroller.align).toBe('end');
      expect(testInstance.tabScroller.incrementScroll(20));
      expect(testInstance.tabScroller.getScrollContentWidth()).toBeDefined();
      expect(testInstance.tabScroller.getScrollPosition()).toBeDefined();
    }));
  });
});

@Component({
  template: `
  <mdc-tab-bar [stacked]="stacked" [fixed]="fixed" [fade]="fade" [align]="align" [activeTabIndex]="activeTabIndex"
    [useAutomaticActivation]="useAutomaticActivation" [iconIndicator]="iconIndicator" (activated)="handleActivatedTab($event)">
    <mdc-tab-scroller>
      <mdc-tab label="Flights" icon="airplanemode_active" [disabled]="disabledTab"></mdc-tab>
      <mdc-tab label="Hotel" icon="hotel"></mdc-tab>
      <mdc-tab label="Favorites" icon="favorite"></mdc-tab>
      <mdc-tab>
        <mdc-icon mdcTabIcon>favorite</mdc-icon>
        <mdc-tab-label>Favorites</mdc-tab-label>
      </mdc-tab>
    </mdc-tab-scroller>
  </mdc-tab-bar>
  `,
})
class SimpleTest {
  fixed: boolean;
  stacked: boolean;
  fade: boolean;
  align: MdcTabScrollerAlignment;
  useAutomaticActivation: boolean;
  activeTabIndex: number;
  iconIndicator: string;
  disabledTab: boolean;

  handleActivatedTab(event: { index: number, tab: MdcTab }) { }
}

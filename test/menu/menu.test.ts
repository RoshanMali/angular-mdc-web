import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  MdcMenu,
  MdcMenuModule,
  MdcListModule,
  MdcListItem,
  MdcMenuSelectionGroup,
  MdcMenuSelectionGroupIcon
} from '@angular-mdc/web';

describe('MdcMenu', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdcMenuModule, MdcListModule],
      declarations: [
        MenuTest,
      ]
    });
    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let testDebugElement: DebugElement;
    let testInstance: MdcMenu;
    let testComponent: MenuTest;

    beforeEach(() => {
      fixture = TestBed.createComponent(MenuTest);
      fixture.detectChanges();

      testDebugElement = fixture.debugElement.query(By.directive(MdcMenu));
      testInstance = testDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('#menu should open', () => {
      testComponent.open = true;
      fixture.detectChanges();
      expect(testInstance.open).toBe(true);
    });

    it('#should have focus', () => {
      expect(document.activeElement).not.toBe(testDebugElement.nativeElement);
      testInstance.focus();
      fixture.detectChanges();
      expect(document.activeElement).toBe(testDebugElement.nativeElement);
    });

    it('#menu should quick open', () => {
      testComponent.quickOpen = true;
      fixture.detectChanges();
      expect(testInstance.quickOpen).toBe(true);
    });

    it('#menu should set fixed', () => {
      testComponent.fixed = false;
      fixture.detectChanges();
      expect(testInstance.fixed).toBe(false);
    });

    it('#menu should set anchor corner', () => {
      testComponent.anchorCorner = 'topEnd';
      fixture.detectChanges();
      expect(testInstance.anchorCorner).toBe('topEnd');

      testComponent.anchorCorner = 'bottomEnd';
      fixture.detectChanges();
      expect(testInstance.anchorCorner).toBe('bottomEnd');

      testComponent.anchorCorner = 'bottomStart';
      fixture.detectChanges();
      expect(testInstance.anchorCorner).toBe('bottomStart');

      expect(testInstance.absolutePosition).toBeDefined();
      expect(testInstance.anchorMargin).toBeDefined();
      expect(testInstance.anchor).toBeDefined();
    });

    it('#should handle click event', () => {
      testDebugElement.nativeElement.click();
      fixture.detectChanges();
    });

    it('#should handle body click event', () => {
      document.body.click();
      fixture.detectChanges();
      expect(testInstance.open).toBe(false);
    });

    it('#should handle list item click', () => {
      const listItemDebugElement = fixture.debugElement.query(By.directive(MdcListItem));
      const listItemInstance = listItemDebugElement.injector.get<MdcListItem>(MdcListItem);

      listItemInstance.getListItemElement().click();
      fixture.detectChanges();
    });
  });
});

@Component({
  template: `
    <div mdcMenuSurfaceAnchor #testanchor>
      <mdc-menu [open]="open" [anchorCorner]="anchorCorner" (select)="handleSelect($event)"
       [anchor]="testanchor" [quickOpen]="quickOpen" [absolutePosition]="{ x: 5, y: 2}"
       [fixed]="fixed" [anchorMargin]="{top: 0, right: 0, bottom: 0, left: 0}">
         <mdc-menu-selection-group>
           <div mdcMenuSelectionGroupIcon>
            <mdc-list>
              <mdc-list-item>Item 1</mdc-list-item>
              <mdc-list-item>Item 2</mdc-list-item>
            </mdc-list>
          </div>
         </mdc-menu-selection-group>
      </mdc-menu>
    </div>
  `,
})
class MenuTest {
  open: boolean;
  anchorCorner: string = 'topStart';
  quickOpen: boolean;
  fixed: boolean = true;

  handleSelect(event) { }
}

import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  MdcDrawerModule,
  MdcListModule,
  MdcIconModule,
  MdcDrawer
} from '@angular-mdc/web';

describe('MdcDrawer', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdcDrawerModule, MdcListModule, MdcIconModule
      ],
      declarations: [SimpleTest]
    });
    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let testDebugElement: DebugElement;
    let testInstance: MdcDrawer;
    let testComponent: SimpleTest;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTest);
      fixture.detectChanges();

      testDebugElement = fixture.debugElement.query(By.directive(MdcDrawer));
      testInstance = testDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('#should set dismissible', () => {
      testComponent.drawer = 'dismissible';
      fixture.detectChanges();
      expect(testInstance.dismissible).toBe(true);

      testInstance.open = false;
      fixture.detectChanges();
      expect(testInstance.open).toBe(false);
    });

    it('#should set permanent if empty', () => {
      testComponent.drawer = null;
      fixture.detectChanges();
      expect(testInstance.permanent).toBe(true);
    });

    it('#should set modal', () => {
      testComponent.drawer = 'modal';
      fixture.detectChanges();

      testInstance.open = true;
      fixture.detectChanges();
      expect(testInstance.open).toBe(true);
    });

    it('#should be open', () => {
      testInstance.open = true;
      fixture.detectChanges();
      expect(testInstance.open).toBe(true);
    });

    it('#should be closed after click', () => {
      testComponent.drawer = 'temporary';
      fixture.detectChanges();

      testDebugElement.nativeElement.click();
      fixture.detectChanges();
      expect(testInstance.open).toBe(false);
    });
  });
});

@Component({
  template: `
  <mdc-drawer [drawer]="drawer" [open]="open" [fixedAdjustElement]="testcontent">
    <mdc-drawer-header title='Test' subtitle='Testing'>
    </mdc-drawer-header>
    <mdc-drawer-content>
      <mdc-list-group>
        <mdc-list useActivatedClass>
          <mdc-list-item>
            <mdc-icon mdc-list-item-start>home</mdc-icon>Home
          </mdc-list-item>
          <mdc-list-item>
            <mdc-icon mdc-list-item-start>star</mdc-icon>Star
          </mdc-list-item>
          <mdc-list-item>
            <mdc-icon mdc-list-item-start>send</mdc-icon>Sent Mail
          </mdc-list-item>
          <mdc-list-item>
            <mdc-icon mdc-list-item-start>drafts</mdc-icon>Drafts
          </mdc-list-item>
        </mdc-list>
        <mdc-list-divider></mdc-list-divider>
        <mdc-list>
          <mdc-list-item>
            <mdc-icon mdc-list-item-start>email</mdc-icon>All Mail
          </mdc-list-item>
          <mdc-list-item>
            <mdc-icon mdc-list-item-start>delete</mdc-icon>Trash
          </mdc-list-item>
          <mdc-list-item>
            <mdc-icon mdc-list-item-start>report</mdc-icon>Spam
          </mdc-list-item>
        </mdc-list>
      </mdc-list-group>
    </mdc-drawer-content>
  </mdc-drawer>
  <div #testcontent></div>
  `,
})
class SimpleTest {
  drawer: string = 'permanent';
  open: boolean;
}

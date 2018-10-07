import { NgModule, Directive, Component, DebugElement, Injector, TemplateRef, ViewContainerRef, ViewChild } from '@angular/core';
import { inject, ComponentFixture, fakeAsync, TestBed, flush, flushMicrotasks } from '@angular/core/testing';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import {
  MdcDialog,
  MdcDialogModule,
  MdcDialogComponent,
  MdcDialogPortal,
  MDC_DIALOG_DATA,
  MdcDialogRef,
  OverlayContainer
} from '@angular-mdc/web';

describe('MdcDialog Service', () => {
  let dialog: MdcDialog;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let scrolledSubject = new Subject();

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
  let mockLocation: SpyLocation;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MdcDialogModule, DialogTestModule],
      providers: [{ provide: Location, useClass: SpyLocation }]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MdcDialog, Location, OverlayContainer],
    (d: MdcDialog, l: Location, oc: OverlayContainer) => {
      dialog = d;
      mockLocation = l as SpyLocation;
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should open a dialog with a component', () => {
    let dialogRef = dialog.open(SimpleDialog, {
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance instanceof SimpleDialog).toBe(true);
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('mdc-dialog')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
  });

  it('should open a dialog with a template', () => {
    const templateRefFixture = TestBed.createComponent(ComponentWithTemplateRef);
    templateRefFixture.componentInstance.localValue = 'Bees';
    templateRefFixture.detectChanges();

    const data = { value: 'Knees' };

    let dialogRef = dialog.open(templateRefFixture.componentInstance.templateRef, { data });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Cheese Bees Knees');
    expect(templateRefFixture.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();

    dialogRef.close();
  });

  it('#should open a simple dialog', () => {
    let dialogRef = dialog.open(SimpleDialog);

    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);
  });

  it('#should open a simple dialog with options', () => {
    let dialogRef = dialog.open(SimpleDialog, {
      clickOutsideToClose: false,
      escapeToClose: false,
      buttonsStacked: false
    });

    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);
  });

  it('should close a dialog and get back a result', fakeAsync(() => {
    let afterCloseCallback = jasmine.createSpy('afterClose callback');
    let dialogRef = dialog.open(SimpleDialog);

    dialogRef.afterClosed().subscribe(afterCloseCallback);
    dialogRef.close('Pizza');

    expect(afterCloseCallback).toHaveBeenCalledWith('Pizza');
  }));

  it('#should close a simple dialog', () => {
    let dialogRef = dialog.open(SimpleDialog);
    expect(dialogRef.close('Pizza'));
  });

  it('#should throw error', () => {
    let dialogRef = dialog.open(SimpleDialog, {
      id: 'mydialog'
    });

    expect(() => {
      dialogRef = dialog.open(SimpleDialog, {
        id: 'mydialog'
      });
    }).toThrow();
  });

  it('should close all of the dialogs', fakeAsync(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mdc-dialog-portal').length).toBe(3);

    dialog.closeAll();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mdc-dialog-portal').length).toBe(0);
  }));

  it('should close the dialog when clicking on the close button', fakeAsync(() => {
    let dialogRef = dialog.open(SimpleDialog);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mdc-dialog-portal').length).toBe(1);

    (overlayContainerElement.querySelector('button[mdcDialogButton]') as HTMLElement).click();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mdc-dialog-portal').length).toBe(0);
  }));
});

@Directive({ selector: 'dir-with-view-container' })
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  selector: 'arbitrary-component',
  template: `<dir-with-view-container></dir-with-view-container>`,
})
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@Component({
  selector: 'arbitrary-component-with-template-ref',
  template: `<ng-template let-data let-dialogRef="dialogRef">
      Cheese {{localValue}} {{data?.value}}{{setDialogRef(dialogRef)}}</ng-template>`,
})
class ComponentWithTemplateRef {
  localValue: string;
  dialogRef: MdcDialogRef<any>;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  setDialogRef(dialogRef: MdcDialogRef<any>): string {
    this.dialogRef = dialogRef;
    return '';
  }
}

/** Simple component for testing ComponentPortal. */
@Component({ template: '<p>Pizza</p> <input> <button>Close</button>' })
class PizzaMsg {
  constructor(public dialogRef: MdcDialogRef<PizzaMsg>,
    public dialogInjector: Injector) { }
}

@Component({
  template: `
  <mdc-dialog>
    <mdc-dialog-container>
      <mdc-dialog-surface>
        <mdc-dialog-title>Use Google's location service?</mdc-dialog-title>
        <mdc-dialog-content>
          Let Google help apps determine location.
        </mdc-dialog-content>
        <mdc-dialog-actions stacked>
          <button mdcDialogButton mdcDialogAction="close">Decline</button>
          <button mdcDialogButton mdcDialogAction>Do Nothing</button>
          <button mdcDialogButton default mdcDialogAction="accept">Accept</button>
        </mdc-dialog-actions>
      </mdc-dialog-surface>
    </mdc-dialog-container>
  </mdc-dialog>
  `,
})
class SimpleDialog {
  constructor(public dialogRef: MdcDialogRef<SimpleDialog>) { }
}

const TEST_DIRECTIVES = [
  SimpleDialog,
  PizzaMsg,
  ComponentWithTemplateRef,
  ComponentWithChildViewContainer,
  DirectiveWithViewContainer
];

@NgModule({
  imports: [MdcDialogModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    SimpleDialog,
    ComponentWithTemplateRef,
    PizzaMsg,
    ComponentWithChildViewContainer
  ],
})
class DialogTestModule { }

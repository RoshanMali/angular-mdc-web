import { NgModule, Component, DebugElement } from '@angular/core';
import { inject, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  MdcDialog,
  MdcDialogModule,
  MdcDialogComponent,
  MdcDialogRef
} from '@angular-mdc/web';

describe('MdcDialog Service', () => {
  let dialog: MdcDialog;

  let dialogDebugElement: DebugElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MdcDialogModule, DialogTestModule],
      providers: [MdcDialog]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MdcDialog], (d: MdcDialog) => {
    dialog = d;
  }));

  it('#should open a simple dialog', () => {
    let dialogRef = dialog.open(SimpleDialog);

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
});


@Component({
  template: `
  <mdc-dialog>
    <mdc-dialog-container>
      <mdc-dialog-surface>
        <mdc-dialog-title>Use Google's location service?</mdc-dialog-title>
        <mdc-dialog-content>
          Let Google help apps determine location.
        </mdc-dialog-content>
        <mdc-dialog-actions [stacked]="stacked">
          <button mdcDialogButton mdcDialogAction="close">Decline</button>
          <button mdcDialogButton [default]="default" mdcDialogAction="accept">Accept</button>
        </mdc-dialog-actions>
      </mdc-dialog-surface>
    </mdc-dialog-container>
  </mdc-dialog>
  `,
})
class SimpleDialog {
  stacked: boolean;
  default: boolean;

  constructor(public dialogRef: MdcDialogRef<SimpleDialog>) { }
}

const TEST_DIRECTIVES = [
  SimpleDialog,
];

@NgModule({
  imports: [MdcDialogModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [SimpleDialog],
})
class DialogTestModule { }

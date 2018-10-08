import { async, fakeAsync, tick, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import {
  Component,
  NgModule,
  ViewChild,
  ViewContainerRef,
  ErrorHandler,
  Injectable,
  EventEmitter,
  NgZone,
} from '@angular/core';
import {
  ComponentPortal,
  PortalModule,
  TemplatePortal,
  CdkPortal,
  Overlay,
  OverlayContainer,
  OverlayModule,
  OverlayRef,
  OverlayConfig
} from '@angular-mdc/web';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';

describe('Overlay', () => {
  let overlay: Overlay;
  let componentPortal: ComponentPortal<PizzaMsg>;
  let templatePortal: TemplatePortal;
  let overlayContainerElement: HTMLElement;
  let overlayContainer: OverlayContainer;
  let viewContainerFixture: ComponentFixture<TestComponentWithTemplatePortals>;
  let mockLocation: SpyLocation;
  let zone: MockNgZone;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, OverlayTestModule],
      providers: [
        {
          provide: NgZone,
          useFactory: () => zone = new MockNgZone()
        },
        {
          provide: Location,
          useClass: SpyLocation
        },
      ],
    }).compileComponents();
  }));

  beforeEach(inject([Overlay, OverlayContainer, Location],
    (o: Overlay, oc: OverlayContainer, l: Location) => {
      overlay = o;
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();

      const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
      fixture.detectChanges();
      templatePortal = fixture.componentInstance.templatePortal;
      componentPortal = new ComponentPortal(PizzaMsg, fixture.componentInstance.viewContainerRef);
      viewContainerFixture = fixture;
      mockLocation = l as SpyLocation;
    }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should load a component into an overlay', () => {
    let overlayRef = overlay.create();
    overlayRef.attach(componentPortal);

    expect(overlayContainerElement.textContent).toContain('Pizza');

    overlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should load a template portal into an overlay', () => {
    let overlayRef = overlay.create();
    overlayRef.attach(templatePortal);

    expect(overlayContainerElement.textContent).toContain('Cake');

    overlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should disable pointer events of the pane element if detached', () => {
    let overlayRef = overlay.create();
    let paneElement = overlayRef.overlayElement;

    overlayRef.attach(componentPortal);
    viewContainerFixture.detectChanges();

    expect(paneElement.childNodes.length).not.toBe(0);
    expect(paneElement.style.pointerEvents)
      .toBe('auto', 'Expected the overlay pane to enable pointerEvents when attached.');

    overlayRef.detach();

    expect(paneElement.childNodes.length).toBe(0);
    expect(paneElement.style.pointerEvents)
      .toBe('none', 'Expected the overlay pane to disable pointerEvents when detached.');
  });

  it('should open multiple overlays', () => {
    let pizzaOverlayRef = overlay.create();
    pizzaOverlayRef.attach(componentPortal);

    let cakeOverlayRef = overlay.create();
    cakeOverlayRef.attach(templatePortal);

    expect(overlayContainerElement.childNodes.length).toBe(2);
    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(overlayContainerElement.textContent).toContain('Cake');

    pizzaOverlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(1);
    expect(overlayContainerElement.textContent).toContain('Cake');

    cakeOverlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should ensure that the most-recently-attached overlay is on top', (() => {
    let pizzaOverlayRef = overlay.create();
    let cakeOverlayRef = overlay.create();

    pizzaOverlayRef.attach(componentPortal);
    cakeOverlayRef.attach(templatePortal);

    expect(pizzaOverlayRef.hostElement.nextSibling)
      .toBeTruthy('Expected pizza to be on the bottom.');
    expect(cakeOverlayRef.hostElement.nextSibling)
      .toBeFalsy('Expected cake to be on top.');

    pizzaOverlayRef.dispose();
    cakeOverlayRef.detach();

    pizzaOverlayRef = overlay.create();
    pizzaOverlayRef.attach(componentPortal);
    cakeOverlayRef.attach(templatePortal);

    expect(pizzaOverlayRef.hostElement.nextSibling)
      .toBeTruthy('Expected pizza to still be on the bottom.');
    expect(cakeOverlayRef.hostElement.nextSibling)
      .toBeFalsy('Expected cake to still be on top.');
  }));

  it('should emit when an overlay is attached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('attachments spy');

    overlayRef.attachments().subscribe(spy);
    overlayRef.attach(componentPortal);

    expect(spy).toHaveBeenCalled();
  });

  it('should emit the attachment event after everything is added to the DOM', () => {
    let config = new OverlayConfig({ hasBackdrop: true });
    let overlayRef = overlay.create(config);

    overlayRef.attachments().subscribe(() => {
      expect(overlayContainerElement.querySelector('pizza'))
        .toBeTruthy('Expected the overlay to have been attached.');

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop'))
        .toBeTruthy('Expected the backdrop to have been attached.');
    });

    overlayRef.attach(componentPortal);
  });

  it('should emit when an overlay is detached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('detachments spy');

    overlayRef.detachments().subscribe(spy);
    overlayRef.attach(componentPortal);
    overlayRef.detach();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit to the detach stream if the overlay has not been attached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('detachments spy');

    overlayRef.detachments().subscribe(spy);
    overlayRef.detach();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit to the detach stream on dispose if the overlay was not attached', () => {
    let overlayRef = overlay.create();
    let spy = jasmine.createSpy('detachments spy');

    overlayRef.detachments().subscribe(spy);
    overlayRef.dispose();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit the detachment event after the overlay is removed from the DOM', () => {
    let overlayRef = overlay.create();

    overlayRef.detachments().subscribe(() => {
      expect(overlayContainerElement.querySelector('pizza'))
        .toBeFalsy('Expected the overlay to have been detached.');
    });

    overlayRef.attach(componentPortal);
    overlayRef.detach();
  });

  it('should emit and complete the observables when an overlay is disposed', () => {
    let overlayRef = overlay.create();
    let disposeSpy = jasmine.createSpy('dispose spy');
    let attachCompleteSpy = jasmine.createSpy('attachCompleteSpy spy');
    let detachCompleteSpy = jasmine.createSpy('detachCompleteSpy spy');

    overlayRef.attachments().subscribe(undefined, undefined, attachCompleteSpy);
    overlayRef.detachments().subscribe(disposeSpy, undefined, detachCompleteSpy);

    overlayRef.attach(componentPortal);
    overlayRef.dispose();

    expect(disposeSpy).toHaveBeenCalled();
    expect(attachCompleteSpy).toHaveBeenCalled();
    expect(detachCompleteSpy).toHaveBeenCalled();
  });

  it('should complete the attachment observable before the detachment one', () => {
    let overlayRef = overlay.create();
    let callbackOrder: string[] = [];

    overlayRef.attachments().subscribe(undefined, undefined, () => callbackOrder.push('attach'));
    overlayRef.detachments().subscribe(undefined, undefined, () => callbackOrder.push('detach'));

    overlayRef.attach(componentPortal);
    overlayRef.dispose();

    expect(callbackOrder).toEqual(['attach', 'detach']);
  });

  it('should clear out all DOM element references on dispose', fakeAsync(() => {
    const overlayRef = overlay.create({ hasBackdrop: true });
    overlayRef.attach(componentPortal);

    expect(overlayRef.hostElement).toBeTruthy('Expected overlay host to be defined.');
    expect(overlayRef.overlayElement).toBeTruthy('Expected overlay element to be defined.');
    expect(overlayRef.backdropElement).toBeTruthy('Expected backdrop element to be defined.');

    overlayRef.dispose();
    tick(500);

    expect(overlayRef.hostElement).toBeFalsy('Expected overlay host not to be referenced.');
    expect(overlayRef.overlayElement).toBeFalsy('Expected overlay element not to be referenced.');
    expect(overlayRef.backdropElement).toBeFalsy('Expected backdrop element not to be referenced.');
  }));

  it('should be able to use the `Overlay` provider during app initialization', () => {
    /** Dummy provider that depends on `Overlay`. */
    @Injectable()
    class CustomErrorHandler extends ErrorHandler {
      constructor(private _overlay: Overlay) { super(); }

      handleError(error: any) {
        const overlayRef = this._overlay.create({ hasBackdrop: !!error });
        overlayRef.dispose();
      }
    }

    overlayContainer.ngOnDestroy();

    TestBed
      .resetTestingModule()
      .configureTestingModule({
        imports: [OverlayModule],
        providers: [
          CustomErrorHandler,
          { provide: ErrorHandler, useExisting: CustomErrorHandler }
        ]
      });

    expect(() => TestBed.compileComponents()).not.toThrow();
  });

  it('should add and remove the overlay host as the ref is being attached and detached', () => {
    const overlayRef = overlay.create();

    overlayRef.attach(componentPortal);
    viewContainerFixture.detectChanges();

    expect(overlayRef.hostElement.parentElement)
      .toBeTruthy('Expected host element to be in the DOM.');

    overlayRef.detach();

    expect(overlayRef.hostElement.parentElement)
      .toBeTruthy('Expected host element not to have been removed immediately.');

    viewContainerFixture.detectChanges();
    zone.simulateZoneExit();

    expect(overlayRef.hostElement.parentElement)
      .toBeFalsy('Expected host element to have been removed once the zone stabilizes.');

    overlayRef.attach(componentPortal);
    viewContainerFixture.detectChanges();

    expect(overlayRef.hostElement.parentElement)
      .toBeTruthy('Expected host element to be back in the DOM.');
  });

  it('should be able to dispose an overlay on navigation', () => {
    const overlayRef = overlay.create({ disposeOnNavigation: true });
    overlayRef.attach(componentPortal);

    expect(overlayContainerElement.textContent).toContain('Pizza');

    mockLocation.simulateUrlPop('');
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  });

  describe('size', () => {
    let config: OverlayConfig;

    beforeEach(() => {
      config = new OverlayConfig();
    });

    it('should apply the width set in the config', () => {
      config.width = 500;

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.width).toBe('500px');
    });

    it('should support using other units if a string width is provided', () => {
      config.width = '200%';

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.width).toBe('200%');
    });

    it('should apply the height set in the config', () => {
      config.height = 500;

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.height).toBe('500px');
    });

    it('should support using other units if a string height is provided', () => {
      config.height = '100vh';

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.height).toBe('100vh');
    });

    it('should apply the min width set in the config', () => {
      config.minWidth = 200;

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.minWidth).toBe('200px');
    });

    it('should apply the min height set in the config', () => {
      config.minHeight = 500;

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.minHeight).toBe('500px');
    });

    it('should apply the max width set in the config', () => {
      config.maxWidth = 200;

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.maxWidth).toBe('200px');
    });


    it('should apply the max height set in the config', () => {
      config.maxHeight = 500;

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.maxHeight).toBe('500px');
    });

    it('should support zero widths and heights', () => {
      config.width = 0;
      config.height = 0;

      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      expect(overlayRef.overlayElement.style.width).toBe('0px');
      expect(overlayRef.overlayElement.style.height).toBe('0px');
    });

    it('should be able to reset the various size properties', () => {
      config.minWidth = config.minHeight = 100;
      config.width = config.height = 200;
      config.maxWidth = config.maxHeight = 300;

      const overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);
      const style = overlayRef.overlayElement.style;

      expect(style.minWidth).toBe('100px');
      expect(style.minHeight).toBe('100px');
      expect(style.width).toBe('200px');
      expect(style.height).toBe('200px');
      expect(style.maxWidth).toBe('300px');
      expect(style.maxHeight).toBe('300px');

      overlayRef.updateSize({
        minWidth: '',
        minHeight: '',
        width: '',
        height: '',
        maxWidth: '',
        maxHeight: ''
      });

      expect(style.minWidth).toBeFalsy();
      expect(style.minHeight).toBeFalsy();
      expect(style.width).toBeFalsy();
      expect(style.height).toBeFalsy();
      expect(style.maxWidth).toBeFalsy();
      expect(style.maxHeight).toBeFalsy();
    });

  });

  describe('backdrop', () => {
    let config: OverlayConfig;

    beforeEach(() => {
      config = new OverlayConfig();
      config.hasBackdrop = true;
    });

    it('should create and destroy an overlay backdrop', () => {
      let overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);

      viewContainerFixture.detectChanges();
      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      expect(backdrop).toBeTruthy();
      expect(backdrop.classList).not.toContain('cdk-overlay-backdrop-showing');

      let backdropClickHandler = jasmine.createSpy('backdropClickHander');
      overlayRef.backdropClick().subscribe(backdropClickHandler);

      backdrop.click();
      expect(backdropClickHandler).toHaveBeenCalledWith(jasmine.any(MouseEvent));
    });

    it('should complete the backdrop click stream once the overlay is destroyed', () => {
      let overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      viewContainerFixture.detectChanges();

      let completeHandler = jasmine.createSpy('backdrop complete handler');

      overlayRef.backdropClick().subscribe(undefined, undefined, completeHandler);
      overlayRef.dispose();

      expect(completeHandler).toHaveBeenCalled();
    });

    it('should disable the pointer events of a backdrop that is being removed', () => {
      let overlayRef = overlay.create(config);
      overlayRef.attach(componentPortal);

      viewContainerFixture.detectChanges();
      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

      expect(backdrop.style.pointerEvents).toBeFalsy();

      overlayRef.detach();

      expect(backdrop.style.pointerEvents).toBe('none');
    });

    it('should insert the backdrop before the overlay host in the DOM order', () => {
      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      viewContainerFixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop');
      const host = overlayContainerElement.querySelector('.cdk-overlay-pane')!.parentElement!;
      const children = Array.prototype.slice.call(overlayContainerElement.children);

      expect(children.indexOf(backdrop)).toBeGreaterThan(-1);
      expect(children.indexOf(host)).toBeGreaterThan(-1);
      expect(children.indexOf(backdrop))
        .toBeLessThan(children.indexOf(host), 'Expected backdrop to be before the host in the DOM');
    });

  });

  describe('panelClass', () => {
    it('should apply a custom overlay pane class', () => {
      const config = new OverlayConfig({ panelClass: 'custom-panel-class' });

      overlay.create(config).attach(componentPortal);
      viewContainerFixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.classList).toContain('custom-panel-class');
    });

    it('should be able to apply multiple classes', () => {
      const config = new OverlayConfig({ panelClass: ['custom-class-one', 'custom-class-two'] });

      overlay.create(config).attach(componentPortal);
      viewContainerFixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

      expect(pane.classList).toContain('custom-class-one');
      expect(pane.classList).toContain('custom-class-two');
    });

    it('should remove the custom panel class when the overlay is detached', () => {
      const config = new OverlayConfig({ panelClass: 'custom-panel-class' });
      const overlayRef = overlay.create(config);

      overlayRef.attach(componentPortal);
      viewContainerFixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.classList).toContain('custom-panel-class', 'Expected class to be added');

      overlayRef.detach();
      zone.simulateZoneExit();
      viewContainerFixture.detectChanges();
      expect(pane.classList).not.toContain('custom-panel-class', 'Expected class to be removed');

      overlayRef.attach(componentPortal);
      viewContainerFixture.detectChanges();
      expect(pane.classList).toContain('custom-panel-class', 'Expected class to be re-added');
    });
  });
});

@Injectable()
export class MockNgZone extends NgZone {
  onStable: EventEmitter<any> = new EventEmitter(false);

  constructor() {
    super({ enableLongStackTrace: false });
  }

  run(fn: Function): any {
    return fn();
  }

  runOutsideAngular(fn: Function): any {
    return fn();
  }

  simulateZoneExit(): void {
    this.onStable.emit(null);
  }
}

/** Simple component for testing ComponentPortal. */
@Component({
  selector: 'pizza',
  template: '<p>Pizza</p>'
})
class PizzaMsg { }


/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({ template: `<ng-template cdk-portal>Cake</ng-template>` })
class TestComponentWithTemplatePortals {
  @ViewChild(CdkPortal) templatePortal: CdkPortal;

  constructor(public viewContainerRef: ViewContainerRef) { }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [PizzaMsg, TestComponentWithTemplatePortals];
@NgModule({
  imports: [OverlayModule, PortalModule],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class OverlayTestModule { }
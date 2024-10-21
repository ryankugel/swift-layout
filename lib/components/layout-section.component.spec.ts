import { Component, ElementRef, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FirstPane } from "../directives/first-pane.directive";
import { LastPane } from "../directives/last-pane.directive";
import { MiddlePane } from "../directives/middle-pane.directive";
import { Constants } from "../models/layout.model";
import { LayoutSectionComponent } from "./layout-section.component";

const testLabel = "LayoutSectionComponent";
describe( testLabel, () => {

  let fixture: ComponentFixture<TestComponent>;
  let componentShell: TestComponent;
  let component: LayoutSectionComponent;

  beforeEach( ( done ) => {
    TestBed.configureTestingModule( {
      imports: [
        BrowserAnimationsModule
      ],
      providers: [],
      declarations: []
    } )
      .compileComponents()
      .then( () => {
        spyOn( console, "error" );
        fixture = TestBed.createComponent( TestComponent );
        fixture.detectChanges();

        componentShell = fixture.componentInstance;
        component = componentShell.component;
        spyOn( ( component as any ), "isStateful" ).and.callThrough();
        spyOn( ( component as any ), "restoreState" ).and.callThrough();
        done();
      } );
  } );

  it( "should compile successfully", ( done ) => {
    const compiled = fixture.nativeElement;
    expect( compiled ).withContext( "Component should be present" ).toBeTruthy();
    done();
  } );

  it( "should render successfully", ( done ) => {
    expect( component ).withContext( "Component should be present" ).toBeTruthy();

    // Look for the root template
    let expectedElements = fixture.debugElement.queryAll( By.css( "div.layout-pane-section" ) );
    expect( expectedElements ).withContext( "Root template element should be found" ).toHaveSize( 1 );

    // Look for two gutter elements
    expectedElements = fixture.debugElement.queryAll( By.css( "div.layout-pane-gutter" ) );
    expect( expectedElements ).withContext( "Both gutter elements should be found" ).toHaveSize( 2 );

    // Look for the 3 pane elements
    expectedElements = fixture.debugElement.queryAll( By.css( "div.layout-pane-content" ) );
    expect( expectedElements ).withContext( "3 panes should be found" ).toHaveSize( 3 );
    done();
  } );

  it( "should initialize the layout section", ( done ) => {
    spyOn( ( component as any ), "calculatePixelSizes" ).and.callThrough();
    spyOn( ( component as any ), "calculateToggleSizes" ).and.callThrough();

    component.ngAfterContentInit();
    expect( ( component as any ).firstPaneTemplate ).withContext( "Should find first pane template" ).toBeDefined();
    expect( ( component as any ).middlePaneTemplate ).withContext( "Should find middle pane template" ).toBeDefined();
    expect( ( component as any ).lastPaneTemplate ).withContext( "Should find last pane template" ).toBeDefined();
    expect( console.error ).withContext( "Should not log error when middle pane is present" ).not.toHaveBeenCalled();
    expect( ( component as any ).isStateful ).withContext( "Should call isStateful() once" ).toHaveBeenCalledTimes( 1 );
    expect( ( component as any ).restoreState ).withContext( "Should call restoreState() once" ).toHaveBeenCalledTimes( 1 );
    expect( ( component as any ).resizeModel.sectionSize ).withContext( "Should set sectionSize initially" ).toEqual( componentShell.elementWidth );
    expect( ( component as any ).calculatePixelSizes ).toHaveBeenCalledTimes( 1 );
    expect( ( component as any ).calculateToggleSizes ).toHaveBeenCalledTimes( 1 );

    spyOn( ( component as any ), "hasStyleClass" ).and.callThrough();

    component.ngAfterViewInit();
    expect( ( component as any ).sectionEl ).withContext( "Should find section element" ).toBeDefined();
    expect( ( component as any ).firstPaneEl ).withContext( "Should find first pane element" ).toBeDefined();
    expect( ( component as any ).lastPaneEl ).withContext( "Should find last pane element" ).toBeDefined();
    expect( ( component as any ).hasStyleClass ).toHaveBeenCalledTimes( 2 );
    expect( ( component as any ).firstGutterEl ).withContext( "Should find the first pane's gutter element" ).toBeDefined();
    expect( ( component as any ).lastGutterEl ).withContext( "Should find the last pane's gutter element" ).toBeDefined();
    done();
  } );

  it( "should detect when the middle pane is missing", ( done ) => {
    component.middlePaneChild = null;
    component.ngAfterContentInit();
    expect( console.error ).withContext( "Should log error when middle pane is missing" ).toHaveBeenCalled();
    done();
  } );

  it( "should not restore state when stateKey is missing", ( done ) => {
    expect( ( component as any ).isStateful ).withContext( "Should not have called isStateful() yet" ).not.toHaveBeenCalled();
    expect( ( component as any ).restoreState ).withContext( "Should not have called restoreState() yet" ).not.toHaveBeenCalled();

    component.stateKey = null;
    component.ngAfterContentInit();
    expect( ( component as any ).isStateful ).withContext( "Should have called isStateful() once" ).toHaveBeenCalledTimes( 1 );
    expect( ( component as any ).restoreState ).withContext( "Should not call restoreState() when stateKey is null" ).not.toHaveBeenCalled();
    done();
  } );

  it( "should get pane sizes", ( done ) => {
    ( component as any ).firstPanePixelSize = 500;
    ( component as any ).lastPanePixelSize = 400;

    ( component as any ).firstPaneVisible = true;
    let result = component.getPaneSize( "first" );
    expect( result ).withContext( "Should return the first pane size when visible" ).toEqual( "500px" );

    ( component as any ).firstPaneVisible = false;
    result = component.getPaneSize( "first" );
    expect( result ).withContext( "Should return 0px when the pane is hidden" ).toEqual( "0px" );

    ( component as any ).lastPaneVisible = true;
    result = component.getPaneSize( "last" );
    expect( result ).withContext( "Should return the last pane size when visible" ).toEqual( "400px" );

    ( component as any ).lastPaneVisible = false;
    result = component.getPaneSize( "last" );
    expect( result ).withContext( "Should return 0px when the pane is hidden" ).toEqual( "0px" );
    done();
  } );

  it( "should calculate pane & toggle pixel sizes", ( done ) => {
    const sectionSize = 600;
    const firstPaneSize = 20;
    const minFirstPaneSize = 5;
    const maxFirstPaneSize = 80;
    const lastPaneSize = 30;
    const minLastPaneSize = 10;
    const maxLastPaneSize = 60;
    component.minFirstPaneSize = minFirstPaneSize;
    component.maxFirstPaneSize = maxFirstPaneSize;
    component.minLastPaneSize = minLastPaneSize;
    component.maxLastPaneSize = maxLastPaneSize;

    spyOn( ( component as any ), "convertPercentageSizeToPixels" ).and.callThrough();
    ( component as any ).calculatePixelSizes( sectionSize, firstPaneSize, lastPaneSize );
    expect( ( component as any ).convertPercentageSizeToPixels ).toHaveBeenCalledTimes( 6 );
    expect( ( component as any ).firstPanePixelSize ).withContext( "Should calculate first pane pixel size" ).toBe( 0.2 * 600 );
    expect( ( component as any ).lastPanePixelSize ).withContext( "Should calculate last pane pixel size" ).toBe( 0.3 * 600 );
    expect( ( component as any ).minFirstPanePixelSize ).withContext( "Should calculate min first pane pixel size" ).toBe( 0.05 * 600 );
    expect( ( component as any ).minLastPanePixelSize ).withContext( "Should calculate min last pane pixel size" ).toBe( 0.1 * 600 );
    expect( ( component as any ).maxFirstPanePixelSize ).withContext( "Should calculate max first pane pixel size" ).toBe( 0.8 * 600 );
    expect( ( component as any ).maxLastPanePixelSize ).withContext( "Should calculate max last pane pixel size" ).toBe( 0.6 * 600 );

    const sectionEl: HTMLElement = component.sectionViewChild.nativeElement;
    component.orientation = "horizontal";
    component.gutterToggleSize = 200;
    component.gutterToggleSizeClosed = 400;

    spyOn( ( component as any ), "convertToggleSizeToPixels" ).and.callThrough();
    ( component as any ).calculateToggleSizes( sectionEl );
    expect( ( component as any ).convertToggleSizeToPixels ).toHaveBeenCalledTimes( 2 );
    expect( ( component as any ).gutterTogglePixelSize ).withContext( "Should set gutter toggle size correctly" ).toBe( 200 );
    expect( ( component as any ).gutterTogglePixelSizeClosed ).withContext( "Should set gutter toggle closed size correctly" ).toBe( 400 );
    done();
  } );

  it( "should get toggle button width", ( done ) => {
    component.orientation = "vertical";
    ( component as any ).gutterTogglePixelSize = 200;
    ( component as any ).gutterTogglePixelSizeClosed = 400;

    let result = component.getToggleButtonWidth( true );
    expect( result ).withContext( "Should return the gutter toggle size when the pane is visible" )
      .toEqual( `${ ( component as any ).gutterTogglePixelSize }px` );

    result = component.getToggleButtonWidth( false );
    expect( result ).withContext( "Should return the gutter toggle closed size when the pane is hidden" )
      .toEqual( `${ ( component as any ).gutterTogglePixelSizeClosed }px` );

    component.orientation = "horizontal";
    result = component.getToggleButtonWidth( true );
    expect( result ).withContext( "Should return gutter size for horizontal layouts" ).toEqual( `${ component.gutterSize }px` );
    result = component.getToggleButtonWidth( false );
    expect( result ).withContext( "Should return gutter size for horizontal layouts regardless of visibility" )
      .toEqual( `${ component.gutterSize }px` );
    done();
  } );

  it( "should get toggle button height", ( done ) => {
    component.orientation = "vertical";
    ( component as any ).gutterTogglePixelSize = 200;
    ( component as any ).gutterTogglePixelSizeClosed = 400;

    let result = component.getToggleButtonHeight( true );
    expect( result ).withContext( "Should return gutter size for vertical layouts" ).toEqual( `${ component.gutterSize }px` );
    result = component.getToggleButtonHeight( false );
    expect( result ).withContext( "Should return gutter size for vertical layouts regardless of visibility" )
      .toEqual( `${ component.gutterSize }px` );

    component.orientation = "horizontal";
    result = component.getToggleButtonHeight( true );
    expect( result ).withContext( "Should return gutter toggle size when the pane is visible" )
      .toEqual( `${ ( component as any ).gutterTogglePixelSize }px` );

    result = component.getToggleButtonHeight( false );
    expect( result ).withContext( "Should return the gutter toggle closed size when the pane is hidden" )
      .toEqual( `${ ( component as any ).gutterTogglePixelSizeClosed }px` );
    done();
  } );

  it( "should get gutter CSS", ( done ) => {
    component.gutterSize = 16;
    expect( component.getGutterStyle().borderRadius ).withContext( "Should get gutter border radius of 8px" ).toEqual( "8px" );
    component.gutterSize = 15;
    expect( component.getGutterStyle().borderRadius ).withContext( "Should round gutter border radius" ).toEqual( "8px" );

    const firstPaneGutterClass = component.getGutterClass( "first" );
    const lastPaneGutterClass = component.getGutterClass( "last" );
    expect( firstPaneGutterClass ).withContext( "Should get correct class for first pane gutter" )
      .toEqual( "layout-pane-gutter gutter-first layout-component" );
    expect( lastPaneGutterClass ).withContext( "Should get correct class for last pane gutter" )
      .toEqual( "layout-pane-gutter gutter-last layout-component" );

    const gutterIconStyle = component.getGutterIconStyle();
    expect( gutterIconStyle.width ).withContext( "Should get correct gutter icon width" ).toEqual( "15px" );
    expect( gutterIconStyle.height ).withContext( "Should get correct gutter icon height" ).toEqual( "15px" );
    done();
  } );

  it( "should toggle panes", ( done ) => {
    component.stateKey = null;

    spyOn( ( component as any ), "saveState" );
    expect( ( component as any ).firstPaneVisible ).withContext( "First pane should be visible initially" ).toBeTrue();
    expect( ( component as any ).lastPaneVisible ).withContext( "Last pane should be visible initially" ).toBeTrue();

    component.onGutterHandleClick( "first" );
    expect( ( component as any ).firstPaneVisible ).withContext( "First pane should now be hidden" ).toBeFalse();
    expect( ( component as any ).lastPaneVisible ).withContext( "Last pane should still be visible" ).toBeTrue();
    expect( ( component as any ).saveState ).withContext( "State should not be saved when stateKey is not present" ).not.toHaveBeenCalled();

    component.stateKey = "testKey";
    component.onGutterHandleClick( "last" );
    expect( ( component as any ).firstPaneVisible ).withContext( "First pane should still be hidden" ).toBeFalse();
    expect( ( component as any ).lastPaneVisible ).withContext( "Last pane should now be hidden" ).toBeFalse();
    expect( ( component as any ).saveState ).withContext( "State should be saved when stateKey is present" ).toHaveBeenCalled();

    component.onGutterHandleClick( "first" );
    expect( ( component as any ).firstPaneVisible ).withContext( "First pane should now be visible again" ).toBeTrue();
    expect( ( component as any ).lastPaneVisible ).withContext( "Last pane should still be hidden" ).toBeFalse();

    component.onGutterHandleClick( "last" );
    expect( ( component as any ).firstPaneVisible ).withContext( "First pane should still be visible" ).toBeTrue();
    expect( ( component as any ).lastPaneVisible ).withContext( "Last pane should now be visible" ).toBeTrue();
    done();
  } );

  it( "should start & end pane resize", ( done ) => {
    spyOn( ( component as any ), "bindMouseListeners" );
    spyOn( ( component as any ), "saveState" );

    const initialSectionSize = ( component as any ).resizeModel.sectionSize;
    const initialStartPos = ( component as any ).resizeModel.startPos;
    const initialFirstPaneSize = ( component as any ).resizeModel.firstPaneSize;
    const initialLastPaneSize = ( component as any ).resizeModel.lastPaneSize;
    const initialPaneResizing = ( component as any ).resizeModel.paneResizing;
    const sectionClasses: DOMTokenList = component.sectionViewChild.nativeElement.classList;
    const gutterClasses: DOMTokenList = component.gutterViewChildren.get( 0 ).nativeElement.classList;
    expect( initialSectionSize ).withContext( "Section size should be set initially" ).toBe( componentShell.elementWidth );
    expect( initialStartPos ).withContext( "Start pos should be null initially" ).toBeNull();
    expect( initialFirstPaneSize ).withContext( "First pane size should be null initially" ).toBeNull();
    expect( initialLastPaneSize ).withContext( "Last pane size should be null initially" ).toBeNull();
    expect( initialPaneResizing ).withContext( "Pane resizing should be null initially" ).toBeNull();
    expect( sectionClasses ).withContext( "Section should not be marked as resizing initially" ).not.toContain( Constants.paneResizingClass );
    expect( gutterClasses ).withContext( "Gutter should not be marked as resizing initially" ).not.toContain( Constants.gutterResizingClass );
    expect( ( component as any ).resizeModel.mouseMoveListener ).withContext( "Should not have mouse listeners initially" ).toBeNull();
    expect( ( component as any ).resizeModel.mouseUpListener ).withContext( "Should not have mouse listeners initially" ).toBeNull();

    // Should not run when the click is a right-click
    const mouseEvent = {
      button: 1,
      target: null,
      pageX: 100,
      pageY: 200
    };
    component.onGutterMouseDown( mouseEvent as MouseEvent, "first", true );
    expect( ( component as any ).bindMouseListeners ).withContext( "Right-click should not trigger resize" ).not.toHaveBeenCalled();

    // Should not run when the pane is hidden
    mouseEvent.button = 0;
    component.onGutterMouseDown( mouseEvent as MouseEvent, "first", false );
    expect( ( component as any ).bindMouseListeners ).withContext( "Hidden panes should not trigger resize" ).not.toHaveBeenCalled();

    // Should not run when the click is on the gutter toggle button
    mouseEvent.target = fixture.debugElement.query( By.css( "button.layout-pane-gutter-toggle" ) ).nativeElement;
    component.onGutterMouseDown( mouseEvent as MouseEvent, "first", true );
    expect( ( component as any ).bindMouseListeners ).withContext( "Clicks on the toggle button should not trigger resize" ).not.toHaveBeenCalled();

    // Should resize when the click is on the gutter
    mouseEvent.target = component.gutterViewChildren.get( 0 ).nativeElement;
    component.onGutterMouseDown( mouseEvent as MouseEvent, "first", true );

    let updatedSectionSize = ( component as any ).resizeModel.sectionSize;
    let updatedStartPos = ( component as any ).resizeModel.startPos;
    let updatedFirstPaneSize = ( component as any ).resizeModel.firstPaneSize;
    let updatedLastPaneSize = ( component as any ).resizeModel.lastPaneSize;
    let updatedPaneResizing = ( component as any ).resizeModel.paneResizing;
    expect( updatedSectionSize ).withContext( "Resize model section size should be populated correctly" ).toBe( componentShell.elementWidth );
    expect( updatedStartPos ).withContext( "Resize model start position should be correct" ).toBe( 100 );
    expect( updatedFirstPaneSize ).withContext( "Resize model first pane size should be 30%" ).toBe( 30 );
    expect( updatedLastPaneSize ).withContext( "Resize model last pane size should be 20%" ).toBe( 20 );
    expect( updatedPaneResizing ).withContext( "Resize model should mark the first pane as resizing" ).toEqual( "first" );
    expect( sectionClasses ).withContext( "Section should now be marked as resizing" ).toContain( Constants.paneResizingClass );
    expect( gutterClasses ).withContext( "Gutter should now be marked as resizing" ).toContain( Constants.gutterResizingClass );
    expect( ( component as any ).resizeModel.mouseMoveListener ).withContext( "Should now have mouse listeners" ).toBeDefined();
    expect( ( component as any ).resizeModel.mouseUpListener ).withContext( "Should now have mouse listeners" ).toBeNull();
    expect( ( component as any ).saveState ).withContext( "State should not be saved until the resize is done" ).not.toHaveBeenCalled();

    ( component as any ).resizeEnd();
    updatedSectionSize = ( component as any ).resizeModel.sectionSize;
    updatedStartPos = ( component as any ).resizeModel.startPos;
    updatedFirstPaneSize = ( component as any ).resizeModel.firstPaneSize;
    updatedLastPaneSize = ( component as any ).resizeModel.lastPaneSize;
    updatedPaneResizing = ( component as any ).resizeModel.paneResizing;

    expect( ( component as any ).saveState ).withContext( "State should be saved once the resize is done" ).toHaveBeenCalled();
    expect( sectionClasses ).withContext( "Section should not have the resizing class" ).not.toContain( Constants.paneResizingClass );
    expect( gutterClasses ).withContext( "Gutter should not have the resizing class" ).not.toContain( Constants.gutterResizingClass );
    expect( updatedSectionSize ).withContext( "Section size should stay populated" ).toBe( componentShell.elementWidth );
    expect( updatedStartPos ).withContext( "Start pos should be reset to null" ).toBeNull();
    expect( updatedFirstPaneSize ).withContext( "First pane size should reset to null" ).toBeNull();
    expect( updatedLastPaneSize ).withContext( "Last pane size should reset to null" ).toBeNull();
    expect( updatedPaneResizing ).withContext( "Pane resizing should reset to null" ).toBeNull();
    done();
  } );

  it( "should resize panes", ( done ) => {
    const mouseDownEvent = {
      button: 0,
      target: component.gutterViewChildren.get( 0 ).nativeElement,
      pageX: 100,
      pageY: 200
    };
    component.onGutterMouseDown( mouseDownEvent as MouseEvent, "first", true );
    expect( ( component as any ).resizeModel.startPos ).withContext( "Should have initial start pos of 100" ).toBe( 100 );

    const gutterEl: HTMLElement = component.gutterViewChildren.get( 0 ).nativeElement;
    let initialFirstPaneSize = ( component as any ).firstPanePixelSize;
    let initialLastPaneSize = ( component as any ).lastPanePixelSize;

    // Increase the pane size by 10px
    const resizeEvent = {
      pageX: 110,
      pageY: 220
    };
    ( component as any ).onResize( resizeEvent );

    let updatedFirstPaneSize = ( component as any ).firstPanePixelSize;
    let updatedLastPaneSize = ( component as any ).lastPanePixelSize;
    expect( updatedFirstPaneSize ).withContext( "Should increase the first pane size by 10" ).toBe( initialFirstPaneSize + 10 );
    expect( updatedLastPaneSize ).withContext( "Should not change the last pane size" ).toBe( initialLastPaneSize );
    expect( ( component as any ).resizeModel.startPos ).withContext( "Should update start pos" ).toBe( 110 );
    expect( gutterEl.classList ).withContext( "Should not have invalidResizeClass" ).not.toContain( Constants.invalidResizeClass );

    // Increase the pane size past its max size
    resizeEvent.pageX = 700;
    initialFirstPaneSize = updatedFirstPaneSize;
    initialLastPaneSize = updatedLastPaneSize;
    ( component as any ).onResize( resizeEvent );

    updatedFirstPaneSize = ( component as any ).firstPanePixelSize;
    updatedLastPaneSize = ( component as any ).lastPanePixelSize;
    expect( updatedFirstPaneSize ).withContext( "Should not change first pane size when resize is invalid" ).toBe( initialFirstPaneSize );
    expect( updatedLastPaneSize ).withContext( "Should not change last pane size when resize is invalid" ).toBe( initialLastPaneSize );
    expect( gutterEl.classList ).withContext( "Gutter should have invalidResizeClass" ).toContain( Constants.invalidResizeClass );

    ( component as any ).resizeEnd();
    done();
  } );

  it( "should validate resizes", ( done ) => {
    let firstPaneSize = 0.08 * componentShell.elementWidth;
    let lastPaneSize = 0.2 * componentShell.elementWidth;
    let result = ( component as any ).validateResize( firstPaneSize, lastPaneSize );
    expect( result ).withContext( "Should return false when the first pane size is under the minimum" ).toBeFalse();

    firstPaneSize = 0.2 * componentShell.elementWidth;
    lastPaneSize = 0.01 * componentShell.elementWidth;
    result = ( component as any ).validateResize( firstPaneSize, lastPaneSize );
    expect( result ).withContext( "Should return false when the last pane size is under the minimum" ).toBeFalse();

    firstPaneSize = 0.5 * componentShell.elementWidth;
    lastPaneSize = 0.2 * componentShell.elementWidth;
    result = ( component as any ).validateResize( firstPaneSize, lastPaneSize );
    expect( result ).withContext( "Should return false when the first pane size is larger than the maximum" ).toBeFalse();

    firstPaneSize = 0.2 * componentShell.elementWidth;
    lastPaneSize = 0.7 * componentShell.elementWidth;
    result = ( component as any ).validateResize( firstPaneSize, lastPaneSize );
    expect( result ).withContext( "Should return false when the last pane size is larger than the maximum" ).toBeFalse();

    lastPaneSize = 0.2 * componentShell.elementWidth;
    result = ( component as any ).validateResize( firstPaneSize, lastPaneSize );
    expect( result ).withContext( "Should return true when both pane sizes are between the min/max values" ).toBeTrue();
    done();
  } );

  it( "should convert percentage sizes to pixels", ( done ) => {
    const sectionSize = 1000;
    let paneSize = 0.15;
    let result = ( component as any ).convertPercentageSizeToPixels( sectionSize, paneSize );
    expect( result ).withContext( "Should convert 0.15 to be 150px" ).toBe( 150 );

    paneSize = 25;
    result = ( component as any ).convertPercentageSizeToPixels( sectionSize, paneSize );
    expect( result ).withContext( "Should convert 25% to be 250px" ).toBe( 250 );

    let toggleSize = 0.02;
    result = ( component as any ).convertToggleSizeToPixels( sectionSize, toggleSize );
    expect( result ).withContext( "Should convert a toggle size of 2% to be 20px" ).toBe( 20 );

    toggleSize = 16;
    result = ( component as any ).convertToggleSizeToPixels( sectionSize, toggleSize );
    expect( result ).withContext( "Should recognize toggle sizes above 1 as a pixel size" ).toBe( toggleSize );
    done();
  } );

  it( "should update pane flex basis", ( done ) => {
    const paneEl: HTMLElement = component.firstPaneViewChild.nativeElement;
    const paneSize = 0.3 * componentShell.elementWidth;
    expect( paneEl.style.flexBasis ).withContext( "Initial flexBasis should be 30% of the section size" ).toEqual( `${ paneSize }px` );

    ( component as any ).setPaneSize( paneEl, 200 );
    expect( paneEl.style.flexBasis ).withContext( "Should update the flexBasis to be 200px" ).toEqual( "200px" );

    ( component as any ).setPaneSize( paneEl, 275 );
    expect( paneEl.style.flexBasis ).withContext( "Should update the flexBasis to be 275px" ).toEqual( "275px" );
    done();
  } );

  it( "should calculate sizes", ( done ) => {
    let result = ( component as any ).calculatePaneSize( null );
    expect( result ).withContext( "Should return null when the element is null" ).toBeNull();

    // Calculate the percentage size of the first pane
    let paneEl = component.firstPaneViewChild.nativeElement;
    result = ( component as any ).calculatePaneSize( paneEl );
    expect( result ).withContext( "Should calculate the first pane size as 30%" ).toBe( 30 );

    // Calculate the percentage size of the last pane
    paneEl = component.lastPaneViewChild.nativeElement;
    result = ( component as any ).calculatePaneSize( paneEl );
    expect( result ).withContext( "Should calculate the last pane size as 20%" ).toBe( 20 );

    // Get the section size in horizontal orientation
    component.orientation = Constants.horizontalOrientation;
    result = ( component as any ).getSectionSize();
    expect( result ).withContext( "Should return the width of the section in horizontal orientation" ).toBe( componentShell.elementWidth );

    // Get the section size in vertical orientation
    component.orientation = Constants.verticalOrientation;
    result = ( component as any ).getSectionSize();
    expect( result ).withContext( "Should return the height of the section in vertical orientation" ).toBe( componentShell.elementHeight );
    done();
  } );

  it( "should automatically resize panes when the section is resized", ( done ) => {
    spyOn( ( component as any ), "setPaneSize" );

    const initialFirstPaneSize = ( component as any ).firstPanePixelSize;
    const initialLastPaneSize = ( component as any ).lastPanePixelSize;
    expect( initialFirstPaneSize ).withContext( "First pane should be 30% of the section initially" ).toBe( 0.3 * componentShell.elementWidth );
    expect( initialLastPaneSize ).withContext( "Last pane should be 20% of the section initially" ).toBe( 0.2 * componentShell.elementWidth );

    // Should return without changing when the sectionSize isn't present
    ( component as any ).resizeModel.sectionSize = null;
    ( component as any ).onSectionResize();
    expect( ( component as any ).setPaneSize ).withContext( "Should not resize when sectionSize isn't present" ).not.toHaveBeenCalled();
    expect( ( component as any ).firstPanePixelSize ).withContext( "First pane should not changed sizes" ).toBe( initialFirstPaneSize );
    expect( ( component as any ).lastPanePixelSize ).withContext( "Last pane should not changed sizes" ).toBe( initialLastPaneSize );

    // Should return without changing when the sectionSize is equal to the new size
    ( component as any ).resizeModel.sectionSize = componentShell.elementWidth;
    ( component as any ).onSectionResize();
    expect( ( component as any ).setPaneSize ).withContext( "Should not resize when sectionSize equals the new size" ).not.toHaveBeenCalled();
    expect( ( component as any ).firstPanePixelSize ).withContext( "First pane should not changed sizes" ).toBe( initialFirstPaneSize );
    expect( ( component as any ).lastPanePixelSize ).withContext( "Last pane should not changed sizes" ).toBe( initialLastPaneSize );

    // Should scale panes down when the section is made smaller
    ( component as any ).resizeModel.sectionSize = componentShell.elementWidth * 2;
    ( component as any ).onSectionResize();
    expect( ( component as any ).setPaneSize ).withContext( "Should resize both panes when the section size is reduced" ).toHaveBeenCalledTimes( 2 );
    expect( ( component as any ).firstPanePixelSize ).withContext( "First pane size should be halved" ).toBe( initialFirstPaneSize / 2 );
    expect( ( component as any ).lastPanePixelSize ).withContext( "Last pane size should be halved" ).toBe( initialLastPaneSize / 2 );
    expect( ( component as any ).resizeModel.sectionSize ).withContext( "Section size should be set to the new size" ).toBe( componentShell.elementWidth );

    ( component as any ).resizeModel.sectionSize = componentShell.elementWidth / 2;
    ( component as any ).onSectionResize();
    expect( ( component as any ).setPaneSize ).withContext( "Should resize both panes when the section size is increased" ).toHaveBeenCalledTimes( 4 );
    expect( ( component as any ).firstPanePixelSize ).withContext( "First pane size should be doubled" ).toBe( initialFirstPaneSize );
    expect( ( component as any ).lastPanePixelSize ).withContext( "Last pane size should be doubled" ).toBe( initialLastPaneSize );
    expect( ( component as any ).resizeModel.sectionSize ).withContext( "Section size should be set to the new size" ).toBe( componentShell.elementWidth );
    done();
  } );

  it( "should detect horizontal & vertical orientations", ( done ) => {
    component.orientation = Constants.horizontalOrientation;
    expect( ( component as any ).isHorizontal() ).withContext( "Should return true when orientation is horizontal" ).toBeTrue();

    component.orientation = Constants.verticalOrientation;
    expect( ( component as any ).isHorizontal() ).withContext( "Should return false when orientation is vertical" ).toBeFalse();
    done();
  } );

  it( "should detect whether to persist state", ( done ) => {
    component.stateKey = null;
    expect( ( component as any ).isStateful() ).withContext( "Should return false when stateKey is null" ).toBeFalse();

    component.stateKey = undefined;
    expect( ( component as any ).isStateful() ).withContext( "Should return false when stateKey is undefined" ).toBeFalse();

    component.stateKey = "testKey";
    expect( ( component as any ).isStateful() ).withContext( "Should return true when stateKey is set" ).toBeTrue();
    done();
  } );

  it( "should persist state", ( done ) => {
    const storage: Storage = ( component as any ).getStorage();
    expect( storage.getItem( component.stateKey ) ).withContext( "State should be null initially" ).toBeNull();

    ( component as any ).resizeModel.sectionSize = 1000;
    ( component as any ).firstPanePixelSize = 200;
    ( component as any ).lastPanePixelSize = 100;
    ( component as any ).firstPaneVisible = true;
    ( component as any ).lastPaneVisible = true;

    // Save the state
    ( component as any ).saveState();

    // Verify the state was saved correctly
    const stateString = storage.getItem( component.stateKey );
    expect( stateString ).withContext( "Saved state should now be found" ).toBeDefined();

    const stateData = JSON.parse( stateString );
    expect( stateData.firstPaneSize ).withContext( "First pane size should be saved correctly" ).toEqual( 200 / 1000 );
    expect( stateData.lastPaneSize ).withContext( "Last pane size should be saved correctly" ).toEqual( 100 / 1000 );
    expect( stateData.firstPaneVisible ).withContext( "First pane visibility should be saved" ).toBeTrue();
    expect( stateData.lastPaneVisible ).withContext( "Last pane visibility should be saved" ).toBeTrue();
    done();
  } );

  it( "should restore from persisted state", ( done ) => {
    expect( component.firstPaneSize ).withContext( "First pane size should be 30 initially" ).toBe( 30 );
    expect( component.lastPaneSize ).withContext( "Last pane size should be 20 initially" ).toBe( 20 );
    expect( ( component as any ).firstPaneVisible ).withContext( "First pane should be visible initially" ).toBeTrue();
    expect( ( component as any ).lastPaneVisible ).withContext( "Last pane should be visible initially" ).toBeTrue();

    const stateData = {
      firstPaneSize: 35,
      lastPaneSize: 15,
      firstPaneVisible: true,
      lastPaneVisible: false
    };

    const storage: Storage = ( component as any ).getStorage();
    storage.setItem( component.stateKey, JSON.stringify( stateData ) );

    // Disable clearing the storage so this saved state actually gets used
    component.clearStorage = false;

    // Verify that state is restored from the saved storage
    let result: boolean = ( component as any ).restoreState();
    expect( result ).withContext( "Should restore state successfully" ).toBeTrue();
    expect( component.firstPaneSize ).withContext( "First pane size should now be 35" ).toBe( 35 );
    expect( component.lastPaneSize ).withContext( "Last pane size should now be 15" ).toBe( 15 );
    expect( ( component as any ).firstPaneVisible ).withContext( "First pane should still be visible" ).toBeTrue();
    expect( ( component as any ).lastPaneVisible ).withContext( "Last pane should now be hidden" ).toBeFalse();

    storage.clear();

    // Verify that restoreState() returns false when there is no saved state
    result = ( component as any ).restoreState();
    expect( result ).withContext( "Should return false when there's no saved state" ).toBeFalse();
    done();
  } );

  it( "should get correct state storage", ( done ) => {
    const sessionStorage: Storage = ( component as any ).window.sessionStorage;
    const localStorage: Storage = ( component as any ).window.localStorage;

    let storage: Storage;
    component.stateStorage = "session";
    storage = ( component as any ).getStorage();
    expect( storage ).toBe( sessionStorage );
    expect( storage ).not.toBe( localStorage );

    component.stateStorage = "local";
    storage = ( component as any ).getStorage();
    expect( storage ).toBe( localStorage );
    expect( storage ).not.toBe( sessionStorage );
    done();
  } );

  it( "should handle DOM interactions", ( done ) => {
    const testDiv = componentShell.testDiv.nativeElement;
    const padding = componentShell.elementPadding;
    const margin = componentShell.elementMargin;
    const borderWidth = componentShell.borderWidth;

    // Width should be calculated as the offset width minus padding and borders
    let actual = ( component as any ).getElementWidth( testDiv );
    let expected = testDiv.offsetWidth - padding - padding - borderWidth - borderWidth;
    expect( actual ).withContext( "Width should be calculated correctly" ).toEqual( expected );
    expect( actual ).withContext( "Calculated width should equal set width" ).toEqual( componentShell.elementWidth );

    // Height should be calculated as the offset height minus padding and borders
    actual = ( component as any ).getElementHeight( testDiv );
    expected = testDiv.offsetHeight - padding - padding - borderWidth - borderWidth;
    expect( actual ).withContext( "Height should be calculated correctly" ).toEqual( expected );
    expect( actual ).withContext( "Calculated height should equal set height" ).toEqual( componentShell.elementHeight );

    // Outer width should be calculated as the offset width plus margins
    actual = ( component as any ).getElementOuterWidth( testDiv, true );
    expected = testDiv.offsetWidth + margin + margin;
    expect( actual ).withContext( "Outer width should be calculated correctly" ).toEqual( expected );
    expect( ( component as any ).getElementOuterWidth( testDiv ) )
      .withContext( "Outer width without margins should equal offset width" )
      .toEqual( testDiv.offsetWidth );

    // Outer height should be calculated as the offset height plus margins
    actual = ( component as any ).getElementOuterHeight( testDiv, true );
    expected = testDiv.offsetHeight + margin + margin;
    expect( actual ).withContext( "Outer height should be calculated correctly" ).toEqual( expected );
    expect( ( component as any ).getElementOuterHeight( testDiv ) )
      .withContext( "Outer width without margins should equal offset height" )
      .toEqual( testDiv.offsetHeight );

    // Verify hasStyleClass, addStyleClass, and removeStyleClass work correctly
    const className = "testClass";
    expect( ( component as any ).hasStyleClass( testDiv, className ) ).withContext( "Should not have class initially" ).toBeFalse();

    ( component as any ).addStyleClass( testDiv, className );
    expect( testDiv.classList ).withContext( "Class list should have 2 classes" ).toHaveSize( 1 );
    expect( testDiv.classList.contains( className ) ).withContext( "Class list should contain testClass" ).toBeTrue();
    expect( testDiv.className.includes( className ) ).withContext( "Class name should contain testClass" ).toBeTrue();
    expect( ( component as any ).hasStyleClass( testDiv, className ) ).withContext( "Should now have class" ).toBeTrue();

    ( component as any ).removeStyleClass( testDiv, className );
    expect( testDiv.classList ).withContext( "Class list should have 1 class" ).toHaveSize( 0 );
    expect( testDiv.classList.contains( className ) ).withContext( "Class list should not have testClass" ).toBeFalse();
    expect( testDiv.className.includes( className ) ).withContext( "Class name should not have testClass" ).toBeFalse();
    expect( ( component as any ).hasStyleClass( testDiv, className ) ).withContext( "Should not have class" ).toBeFalse();
    done();
  } );

} );

@Component( {
  selector: "test-cmp",
  template: `
    <div #testDiv [style]="{
        width: getElementWidth(), height: getElementHeight(),
        padding: getElementPadding(), margin: getElementMargin(),
        border: getElementBorder()
    }">
      <swift-layout-section #sectionComponent orientation="horizontal" stateKey="testKey_horizontal"
                            stateStorage="local" [clearStorage]="true"
                            [gutterSize]="20" [gutterToggleSize]="200" [gutterToggleSizeClosed]="0.5"
                            [firstPaneSize]="30" [minFirstPaneSize]="10" [maxFirstPaneSize]="40"
                            [lastPaneSize]="20" [minLastPaneSize]="2" [maxLastPaneSize]="60">
        <ng-template firstPane>
          <div class="first-pane-content">First Pane</div>
        </ng-template>

        <ng-template middlePane>
          <div class="middle-pane-content">Middle Pane</div>
        </ng-template>

        <ng-template lastPane>
          <div class="last-pane-content">Last Pane</div>
        </ng-template>
      </swift-layout-section>
    </div>
  `,
  imports: [
    LayoutSectionComponent,
    FirstPane,
    MiddlePane,
    LastPane
  ],
  standalone: true
} )
class TestComponent {

  @ViewChild( "sectionComponent" ) component: LayoutSectionComponent;

  @ViewChild( "testDiv" ) testDiv: ElementRef<HTMLDivElement>;

  elementWidth = 600;
  elementHeight = 400;
  elementPadding = 8;
  elementMargin = 4;
  borderWidth = 1;

  getElementWidth() {
    return `${ this.elementWidth }px`;
  }

  getElementHeight() {
    return `${ this.elementHeight }px`;
  }

  getElementPadding() {
    return `${ this.elementPadding }px`;
  }

  getElementMargin() {
    return `${ this.elementMargin }px`;
  }

  getElementBorder() {
    return `${ this.borderWidth }px solid black`;
  }

}

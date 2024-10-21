import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Pane } from "../directives/pane.directive";
import { Constants } from "../models/layout.model";
import { LayoutComponent } from "./layout.component";

const testLabel = "LayoutComponent";
describe( testLabel, () => {

  let fixture: ComponentFixture<TestComponent>;
  let componentShell: TestComponent;
  let component: LayoutComponent;

  beforeEach( ( done ) => {
    TestBed.configureTestingModule( {
      imports: [
        BrowserAnimationsModule
      ]
    } )
      .compileComponents()
      .then( () => {
        fixture = TestBed.createComponent( TestComponent );
        fixture.detectChanges();

        componentShell = fixture.componentInstance;
        component = componentShell.component;
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

    const expectedElements = fixture.debugElement.queryAll( By.css( "div.swift-layout" ) );
    expect( expectedElements ).withContext( "Root template element should be found" ).toHaveSize( 1 );
    done();
  } );

  it( "should initialize the layout", ( done ) => {
    // Check that the center pane was found
    expect( ( component as any ).centerPaneTemplate ).withContext( "Center pane template should be present" ).toBeDefined();

    // Check that the top pane was found
    expect( ( component as any ).topPaneTemplate ).withContext( "Top pane template should be present" ).toBeDefined();
    expect( ( component as any ).topPaneSize ).withContext( "Top pane size should be 10%" ).toBe( 10 );
    expect( ( component as any ).topPaneMinSize ).withContext( "Top pane min size should be the default" ).toBe( 5 );
    expect( ( component as any ).topPaneMaxSize ).withContext( "Top pane max size should be the default" ).toBe( 50 );

    // Check that the bottom pane was found
    expect( ( component as any ).bottomPaneTemplate ).withContext( "Bottom pane template should be present" ).toBeDefined();
    expect( ( component as any ).bottomPaneSize ).withContext( "Bottom pane size should be 10%" ).toBe( 10 );
    expect( ( component as any ).bottomPaneMinSize ).withContext( "Bottom pane min size should be the default" ).toBe( 5 );
    expect( ( component as any ).bottomPaneMaxSize ).withContext( "Bottom pane max size should be the default" ).toBe( 50 );

    // Check that the left pane was found
    expect( ( component as any ).leftPaneTemplate ).withContext( "Left pane template should be present" ).toBeDefined();
    expect( ( component as any ).leftPaneSize ).withContext( "Left pane size should be 30%" ).toBe( 30 );
    expect( ( component as any ).leftPaneMinSize ).withContext( "Left pane min size should be 10%" ).toBe( 10 );
    expect( ( component as any ).leftPaneMaxSize ).withContext( "Left pane max size should be 45%" ).toBe( 45 );

    // Check that the right pane was found
    expect( ( component as any ).rightPaneTemplate ).withContext( "Right pane template should be present" ).toBeDefined();
    expect( ( component as any ).rightPaneSize ).withContext( "Right pane size should be 20%" ).toBe( 20 );
    expect( ( component as any ).rightPaneMinSize ).withContext( "Right pane min size should be 15%" ).toBe( 15 );
    expect( ( component as any ).rightPaneMaxSize ).withContext( "Right pane max size should be 40%" ).toBe( 40 );
    done();
  } );

  it( "should get the state key for each section", ( done ) => {
    expect( component.stateKey ).withContext( "State key should be null initially" ).toBeNull();
    let stateKey = ( component as any ).getStateKey( Constants.horizontalOrientation );
    expect( stateKey ).withContext( "Section state key should be null when the state key is null" ).toBeNull();

    // Horizontal section state key
    component.stateKey = "testKey";
    stateKey = ( component as any ).getStateKey( Constants.horizontalOrientation );
    expect( stateKey ).withContext( "Should build correct horizontal section state key" ).toEqual( "testKey_horizontal" );

    // Vertical section state key
    stateKey = ( component as any ).getStateKey( Constants.verticalOrientation );
    expect( stateKey ).withContext( "Should build correct vertical section state key" ).toEqual( "testKey_vertical" );
    done();
  } );

} );

@Component( {
  selector: "test-cmp",
  template: `
    <swift-layout #layoutComponent [gutterSize]="16" [gutterToggleSize]="200" [gutterToggleSizeClosed]="0.5">
      <ng-template pane="left" [size]="30" [minSize]="10" [maxSize]="45">
        <div class="pane-content-demo">Left Pane</div>
      </ng-template>

      <ng-template pane="right" [size]="20" [minSize]="15" [maxSize]="40">
        <div class="pane-content-demo">Right Pane</div>
      </ng-template>

      <ng-template pane="center">
        <div class="pane-content-demo">Center Pane</div>
      </ng-template>

      <ng-template pane="top" [size]="10">
        <div class="pane-content-demo">Top Pane</div>
      </ng-template>

      <ng-template pane="bottom" [size]="10">
        <div class="pane-content-demo">Bottom Pane</div>
      </ng-template>
    </swift-layout>
  `,
  standalone: true,
  imports: [
    LayoutComponent,
    Pane
  ]
} )
class TestComponent {

  @ViewChild( "layoutComponent" ) component: LayoutComponent;

}

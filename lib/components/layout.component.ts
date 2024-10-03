import { NgStyle, NgTemplateOutlet } from "@angular/common";
import { AfterContentInit, Component, ContentChildren, Input, QueryList, TemplateRef } from "@angular/core";
import { FirstPane } from "../directives/first-pane.directive";
import { LastPane } from "../directives/last-pane.directive";
import { MiddlePane } from "../directives/middle-pane.directive";
import { Pane } from "../directives/pane.directive";
import { LayoutOrientation, PaneRegion, StateStorage } from "../models/layout.model";
import { LayoutSectionComponent } from "./layout-section.component";

@Component( {
  selector: "swift-layout",
  templateUrl: "layout.component.html",
  standalone: true,
  imports: [
    NgStyle,
    NgTemplateOutlet,
    FirstPane,
    MiddlePane,
    LastPane,
    LayoutSectionComponent
  ]
} )
export class LayoutComponent implements AfterContentInit {

  /**
   * Custom CSS to apply to the container.
   */
  @Input() style: { [key: string]: any } = {};

  /**
   * The size in pixels of the resize bar (the gutter).
   */
  @Input() gutterSize: number = 14;

  /**
   * The size in pixels of the resize bar toggle button.
   */
  @Input() gutterToggleSize: number = 65;

  /**
   * The size in pixels of the resize bar toggle button when the pane is closed.
   */
  @Input() gutterToggleSizeClosed: number;

  /**
   * Key used to save the state of the layout.
   */
  @Input() stateKey: string = null;

  /**
   * Defines where state is stored, either 'session' or 'local'.
   */
  @Input() stateStorage: StateStorage = "session";

  @ContentChildren( Pane ) templates: QueryList<Pane>;

  protected centerPaneTemplate: TemplateRef<any>;
  protected topPaneTemplate: TemplateRef<any>;
  protected bottomPaneTemplate: TemplateRef<any>;
  protected leftPaneTemplate: TemplateRef<any>;
  protected rightPaneTemplate: TemplateRef<any>;

  protected topPaneSize: number;
  protected topPaneMinSize: number;
  protected topPaneMaxSize: number;

  protected bottomPaneSize: number;
  protected bottomPaneMinSize: number;
  protected bottomPaneMaxSize: number;

  protected leftPaneSize: number;
  protected leftPaneMinSize: number;
  protected leftPaneMaxSize: number;

  protected rightPaneSize: number;
  protected rightPaneMinSize: number;
  protected rightPaneMaxSize: number;

  ngAfterContentInit() {
    if( !this.gutterToggleSizeClosed ) {
      this.gutterToggleSizeClosed = this.gutterToggleSize;
    }

    this.templates.forEach( item => {
      switch( item.getPaneRegion() ) {
        case "center":
          if( !this.centerPaneTemplate ) {
            this.centerPaneTemplate = item.template;
          }
          else {
            this.logDuplicatePane( "center" );
          }
          break;
        case "top":
          if( !this.topPaneTemplate ) {
            this.topPaneSize = item.size;
            this.topPaneMinSize = item.minSize;
            this.topPaneMaxSize = item.maxSize;
            this.topPaneTemplate = item.template;
          }
          else {
            this.logDuplicatePane( "top" );
          }
          break;
        case "bottom":
          if( !this.bottomPaneTemplate ) {
            this.bottomPaneSize = item.size;
            this.bottomPaneMinSize = item.minSize;
            this.bottomPaneMaxSize = item.maxSize;
            this.bottomPaneTemplate = item.template;
          }
          else {
            this.logDuplicatePane( "bottom" );
          }
          break;
        case "left":
          if( !this.leftPaneTemplate ) {
            this.leftPaneSize = item.size;
            this.leftPaneMinSize = item.minSize;
            this.leftPaneMaxSize = item.maxSize;
            this.leftPaneTemplate = item.template;
          }
          else {
            this.logDuplicatePane( "left" );
          }
          break;
        case "right":
          if( !this.rightPaneTemplate ) {
            this.rightPaneSize = item.size;
            this.rightPaneMinSize = item.minSize;
            this.rightPaneMaxSize = item.maxSize;
            this.rightPaneTemplate = item.template;
          }
          else {
            this.logDuplicatePane( "right" );
          }
          break;
      }
    } );
  }

  protected getStateKey( orientation: LayoutOrientation ): string {
    if( !this.stateKey ) {
      return null;
    }
    return `${ this.stateKey }_${ orientation }`;
  }

  private logDuplicatePane( pane: PaneRegion ) {
    console.error( `Duplicate pane found: "${ pane }", ignoring the duplicate.` );
  }

}

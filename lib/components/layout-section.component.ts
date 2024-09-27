import { animate, state, style, transition, trigger } from "@angular/animations";
import { DOCUMENT, NgClass, NgStyle, NgTemplateOutlet } from "@angular/common";
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  Inject,
  Input,
  QueryList, Renderer2,
  TemplateRef,
  ViewChild,
  ViewChildren
} from "@angular/core";
import { FirstPane } from "../directives/first-pane.directive";
import { LastPane } from "../directives/last-pane.directive";
import { MiddlePane } from "../directives/middle-pane.directive";
import { LayoutOrientation, SavedState, StateStorage, VoidListener } from "../models/layout.model";
import { LayoutUtil } from "../util/layout.util";

type PaneType = "first" | "last";

@Component( {
  selector: "swift-layout-section",
  templateUrl: "layout-section.component.html",
  animations: [
    trigger( "toggle", [
      state(
        "*",
        style( {
          flexBasis: "{{ paneSize }}"
        } ),
        {
          params: {
            paneSize: ""
          }
        }
      ),
      transition( "false <=> true", animate( "0.2s" ) )
    ] )
  ],
  standalone: true,
  imports: [
    NgStyle,
    NgClass,
    NgTemplateOutlet
  ]
} )
export class LayoutSectionComponent implements AfterContentInit, AfterViewInit {

  /**
   * The direction of panes in the layout, either 'horizontal' or 'vertical'.
   */
  @Input() orientation: LayoutOrientation = "horizontal";

  /**
   * The size in pixels of the resize bar (the gutter).
   */
  @Input() gutterSize: number;

  /**
   * The initial size of the first pane as a percentage.
   */
  @Input() firstPaneSize: number;

  /**
   * The initial size of the last pane as a percentage.
   */
  @Input() lastPaneSize: number;

  /**
   * The minimum size of the first pane as a percentage.
   */
  @Input() minFirstPaneSize: number;

  /**
   * The minimum size of the last pane as a percentage.
   */
  @Input() minLastPaneSize: number;

  /**
   * The maximum size of the first pane as a percentage.
   */
  @Input() maxFirstPaneSize: number;

  /**
   * The maximum size of the last pane as a percentage.
   */
  @Input() maxLastPaneSize: number;

  /**
   * Key used to save the state of the layout.
   */
  @Input() stateKey: string;

  /**
   * Defines where state is stored, either 'session' or 'local'.
   */
  @Input() stateStorage: StateStorage;

  @ContentChild( FirstPane ) firstPaneChild: FirstPane;
  @ContentChild( MiddlePane ) middlePaneChild: MiddlePane;
  @ContentChild( LastPane ) lastPaneChild: LastPane;

  // ViewChildren for the section, panes
  @ViewChild( "section" ) sectionViewChild: ElementRef;
  @ViewChild( "firstPane" ) firstPaneViewChild: ElementRef;
  @ViewChild( "middlePane" ) middlePaneViewChild: ElementRef;
  @ViewChild( "lastPane" ) lastPaneViewChild: ElementRef;

  // ViewChildren for the gutters
  @ViewChildren( "gutter" ) gutterViewChildren: QueryList<ElementRef>;

  firstPaneTemplate: TemplateRef<any>;
  middlePaneTemplate: TemplateRef<any>;
  lastPaneTemplate: TemplateRef<any>;

  // The visibility state of the collapsible panes
  firstPaneVisible: boolean = true;
  lastPaneVisible: boolean = true;

  // Variables to track pane resizing
  resizeModel = {
    dragging: false,
    sectionSize: null as number,
    startPos: null as number,
    firstPaneSize: null as number,
    middlePaneSize: null as number,
    lastPaneSize: null as number,
    paneResizing: null as PaneType,
    mouseMoveListener: null as VoidListener,
    mouseUpListener: null as VoidListener
  };

  // The actual size in pixels of the panes
  private firstPanePixelSize: number;
  private lastPanePixelSize: number;

  // The actual min/max sizes of panes in pixels
  private minFirstPanePixelSize: number;
  private minLastPanePixelSize: number;
  private maxFirstPanePixelSize: number;
  private maxLastPanePixelSize: number;

  private window: Window;

  // Elements for the section, panes, and gutter
  private sectionEl: HTMLElement;
  private firstPaneEl: HTMLElement;
  private middlePaneEl: HTMLElement;
  private lastPaneEl: HTMLElement;
  private firstGutterEl: HTMLElement;
  private lastGutterEl: HTMLElement;

  constructor( @Inject( DOCUMENT ) private document: Document, private elRef: ElementRef, private renderer: Renderer2 ) {
    this.window = this.document.defaultView;
  }

  ngAfterContentInit() {
    this.firstPaneTemplate = this.firstPaneChild?.template;
    this.middlePaneTemplate = this.middlePaneChild?.template;
    this.lastPaneTemplate = this.lastPaneChild?.template;

    if( !this.middlePaneChild ) {
      console.error( "LayoutSection: Middle pane must be present." );
    }

    // Override inputs if there is saved state data
    if( this.isStateful() ) {
      this.restoreState();
    }

    // Get the initial sizes of panes in pixels
    const sectionEl = this.elRef.nativeElement.querySelector( ".layout-pane-section" );
    this.resizeModel.sectionSize = this.isHorizontal()
      ? LayoutUtil.getWidth( sectionEl )
      : LayoutUtil.getHeight( sectionEl );
    const sectionSize = this.resizeModel.sectionSize;
    this.calculatePixelSizes( sectionSize );
  }

  ngAfterViewInit() {
    // Pull elements from ViewChildren
    this.sectionEl = this.sectionViewChild.nativeElement;
    this.firstPaneEl = this.firstPaneViewChild?.nativeElement;
    this.middlePaneEl = this.middlePaneViewChild?.nativeElement;
    this.lastPaneEl = this.lastPaneViewChild?.nativeElement;

    this.gutterViewChildren.forEach( gutterElRef => {
      let gutterEl: HTMLElement = gutterElRef.nativeElement;
      if( LayoutUtil.hasClass( gutterEl, "gutter-first" ) ) {
        this.firstGutterEl = gutterEl;
      }
      else {
        this.lastGutterEl = gutterEl;
      }
    } );

    new ResizeObserver( data => this.onSectionResize( data[ 0 ]?.contentRect ) )
      .observe( this.sectionEl );
  }

  getPaneSize( pane: PaneType ): string {
    let paneVisible: boolean;
    let paneSize: number;

    if( pane === "first" ) {
      paneVisible = this.firstPaneVisible;
      paneSize = this.firstPanePixelSize;
    }
    else {
      paneVisible = this.lastPaneVisible;
      paneSize = this.lastPanePixelSize;
    }

    // If not hidden, return the size of the pane
    if( paneVisible ) {
      return `${ paneSize }px`;
    }

    // Hide the pane otherwise
    return "0px";
  }

  /**
   * Starts the process of resizing panes.
   * @param {MouseEvent} event
   * @param {PaneType} pane
   * @param {boolean} paneVisible
   */
  onGutterMouseDown( event: MouseEvent, pane: PaneType, paneVisible: boolean ) {
    if( event.button !== 0 || !paneVisible || !LayoutUtil.hasClass( event.target as HTMLElement, "layout-pane-gutter" ) ) {
      return;
    }

    // Initialize variables for handling the resize
    this.resizeModel.sectionSize = this.isHorizontal()
      ? LayoutUtil.getWidth( this.sectionEl )
      : LayoutUtil.getHeight( this.sectionEl );
    this.resizeModel.dragging = true;
    this.resizeModel.startPos = this.isHorizontal() ? event.pageX : event.pageY;
    this.resizeModel.firstPaneSize = this.calculatePaneSize( this.firstPaneEl );
    this.resizeModel.middlePaneSize = this.calculatePaneSize( this.middlePaneEl );
    this.resizeModel.lastPaneSize = this.calculatePaneSize( this.lastPaneEl );
    this.resizeModel.paneResizing = pane;

    // Update element classes for resize
    let gutterEl = pane === "first" ? this.firstGutterEl : this.lastGutterEl;
    LayoutUtil.addClass( this.sectionEl, "pane-resizing" );
    LayoutUtil.addClass( gutterEl, "pane-gutter-resizing" );

    this.bindMouseListeners();
  }

  /**
   * Toggles the visibility of the selected pane.
   * @param {PaneType} pane
   */
  onGutterHandleClick( pane: PaneType ) {
    if( pane === "first" ) {
      this.firstPaneVisible = !this.firstPaneVisible;
    }
    else {
      this.lastPaneVisible = !this.lastPaneVisible;
    }

    if( this.isStateful() ) {
      this.saveState();
    }
  }

  /**
   * Returns styling for the gutter handle, depending on the orientation of the layout.
   */
  getGutterStyle(): { width?: string, height?: string, "border-radius": string } {
    const borderRadius = Math.round( this.gutterSize / 2 );
    return this.isHorizontal()
      ? { width: `${ this.gutterSize }px`, "border-radius": `${ borderRadius }px` }
      : { height: `${ this.gutterSize }px`, "border-radius": `${ borderRadius }px` };
  }

  /**
   * Returns the CSS classes for the gutter element.
   * @param {PaneType} pane
   */
  getGutterClass( pane: PaneType ): string {
    return `layout-pane-gutter gutter-${ pane } layout-component`;
  }

  /**
   * Returns styling for the gutter icon.
   */
  getGutterIconStyle(): { width: string, height: string } {
    return { width: `${ this.gutterSize }px`, height: `${ this.gutterSize }px` };
  }

  /**
   * Resizes the panes based on the position of the mouse.
   * @param {MouseEvent} event
   * @private
   */
  private onResize( event: MouseEvent ) {
    let newPos = this.isHorizontal()
      ? event.pageX - this.resizeModel.startPos
      : event.pageY - this.resizeModel.startPos;

    let newFirstPaneSize = this.firstPanePixelSize;
    let newLastPaneSize = this.lastPanePixelSize;


    if( this.resizeModel.paneResizing === "first" ) {
      newFirstPaneSize += newPos;
    }
    else {
      newLastPaneSize -= newPos;
    }

    const gutterEl = this.resizeModel.paneResizing === "first" ? this.firstGutterEl : this.lastGutterEl;

    // If the new sizes for panes are valid, update the pane sizes (which automatically updates the elements)
    if( this.validateResize( newFirstPaneSize, newLastPaneSize ) ) {
      if( LayoutUtil.hasClass( gutterEl, "invalid-resize" ) ) {
        LayoutUtil.removeClass( gutterEl, "invalid-resize" );
      }

      this.firstPanePixelSize = newFirstPaneSize;
      this.lastPanePixelSize = newLastPaneSize;
      this.resizeModel.startPos = this.isHorizontal() ? event.pageX : event.pageY;
    }
    // When the resize is invalid, adjust the gutter to indicate it's reached the limit
    else {
      const gutterEl = this.resizeModel.paneResizing === "first" ? this.firstGutterEl : this.lastGutterEl;
      if( !LayoutUtil.hasClass( gutterEl, "invalid-resize" ) ) {
        LayoutUtil.addClass( gutterEl, "invalid-resize" );
      }
    }
  }

  /**
   * Completes the process of resizing panes.
   * @private
   */
  private resizeEnd() {
    if( this.isStateful() ) {
      this.saveState();
    }

    let gutterEl = this.resizeModel.paneResizing === "first" ? this.firstGutterEl : this.lastGutterEl;
    LayoutUtil.removeClass( gutterEl, "pane-gutter-resizing" );
    LayoutUtil.removeClass( this.sectionEl, "pane-resizing" );

    this.resetResizeModel();
  }

  /**
   * Ensures the requested resize to panes is within the bounds of their min & max values.
   * @param {number} firstPaneSize
   * @param {number} lastPaneSize
   * @private
   */
  private validateResize( firstPaneSize: number, lastPaneSize: number ): boolean {
    // Check that the new sizes don't exceed the minimum pane sizes
    if( this.minFirstPanePixelSize > firstPaneSize ) {
      return false;
    }
    if( this.minLastPanePixelSize > lastPaneSize ) {
      return false;
    }

    // Check that the new sizes don't exceed the maximum pane sizes
    if( firstPaneSize > this.maxFirstPanePixelSize ) {
      return false;
    }
    if( lastPaneSize > this.maxLastPanePixelSize ) {
      return false;
    }

    // Otherwise the resize is valid
    return true;
  }

  /**
   * Calculates and sets the pixel sizes of panes, and their min/max values.
   * @param {number} sectionSize
   * @param {number} firstPaneSize
   * @param {number} lastPaneSize
   * @private
   */
  private calculatePixelSizes( sectionSize: number, firstPaneSize: number = this.firstPaneSize, lastPaneSize: number = this.lastPaneSize ) {
    // Sizes of the panes in pixels
    this.firstPanePixelSize = this.convertPercentageSizeToPixels( sectionSize, firstPaneSize );
    this.lastPanePixelSize = this.convertPercentageSizeToPixels( sectionSize, lastPaneSize );

    // Minimum sizes of panes in pixels
    this.minFirstPanePixelSize = this.convertPercentageSizeToPixels( sectionSize, this.minFirstPaneSize );
    this.minLastPanePixelSize = this.convertPercentageSizeToPixels( sectionSize, this.minLastPaneSize );

    // Maximum sizes of panes in pixels
    this.maxFirstPanePixelSize = this.convertPercentageSizeToPixels( sectionSize, this.maxFirstPaneSize );
    this.maxLastPanePixelSize = this.convertPercentageSizeToPixels( sectionSize, this.maxLastPaneSize );
  }

  /**
   * Converts a size given as a percentage into pixels.
   * @param {number} sectionSize
   * @param {number} paneSize
   * @private
   */
  private convertPercentageSizeToPixels( sectionSize: number, paneSize: number ): number {
    let panePercentage: number;

    // Account for the initial pane size being provided as a decimal between 0 and 1
    if( paneSize < 1 ) {
      panePercentage = paneSize;
    }
    else {
      panePercentage = paneSize / 100;
    }

    return Math.round( panePercentage * sectionSize );
  }

  /**
   * Forcibly resize the given pane to the given size.
   * Used when the window resizes to automatically resize panes accordingly.
   * @param {HTMLElement} paneEl
   * @param {number} size
   * @private
   */
  private setPaneSize( paneEl: HTMLElement, size: number ) {
    if( !paneEl ) {
      return;
    }
    paneEl.style.flexBasis = `${ size }px`;
  }

  /**
   * Calculates the size of the given pane as a percentage.
   * @param {HTMLElement} paneEl
   * @private
   */
  private calculatePaneSize( paneEl: HTMLElement ): number {
    if( !paneEl ) {
      return null;
    }

    return ( 100 * ( this.isHorizontal()
      ? LayoutUtil.getOuterWidth( paneEl, true )
      : LayoutUtil.getOuterHeight( paneEl, true ) ) ) / this.resizeModel.sectionSize;
  }

  /**
   * React to the section being resized and resize panes to maintain their current size as a percentage.
   * @param {DOMRectReadOnly} rect
   */
  private onSectionResize( rect: DOMRectReadOnly ) {
    if( !this.resizeModel.sectionSize ) {
      return;
    }

    const newSize = this.isHorizontal() ? rect.width : rect.height;

    // Only handle resize events that we haven't adjusted pane sizes to yet.
    if( newSize === this.resizeModel.sectionSize ) {
      return;
    }

    // Adjust the pixel sizes of panes, and their min/max values for the new section size
    const firstPaneSize = this.firstPanePixelSize / this.resizeModel.sectionSize;
    const lastPaneSize = this.lastPanePixelSize / this.resizeModel.sectionSize;

    this.calculatePixelSizes( newSize, firstPaneSize, lastPaneSize );

    this.setPaneSize( this.firstPaneEl, this.firstPanePixelSize );
    this.setPaneSize( this.lastPaneEl, this.lastPanePixelSize );
    this.resizeModel.sectionSize = newSize;
  }

  /**
   * Listens for the movement of the mouse and the release of the mouse button.
   * @private
   */
  private bindMouseListeners() {
    if( !this.resizeModel.mouseMoveListener ) {
      this.resizeModel.mouseMoveListener = this.renderer.listen( this.document, "mousemove", event => this.onResize( event ) );
    }

    if( !this.resizeModel.mouseUpListener ) {
      this.resizeModel.mouseUpListener = this.renderer.listen( this.document, "mouseup", () => {
        this.resizeEnd();
        this.unbindMouseListeners();
      } );
    }
  }

  /**
   * Stops listening to the mouse movement and mouse button release.
   * @private
   */
  private unbindMouseListeners() {
    if( this.resizeModel.mouseMoveListener ) {
      this.resizeModel.mouseMoveListener();
      this.resizeModel.mouseMoveListener = null;
    }

    if( this.resizeModel.mouseUpListener ) {
      this.resizeModel.mouseUpListener();
      this.resizeModel.mouseUpListener = null;
    }
  }

  /**
   * Resets the resize model after the resize is complete.
   * @private
   */
  private resetResizeModel() {
    this.resizeModel.dragging = false;
    this.resizeModel.startPos = null;
    this.resizeModel.firstPaneSize = null;
    this.resizeModel.middlePaneSize = null;
    this.resizeModel.lastPaneSize = null;
    this.resizeModel.paneResizing = null;
  }

  /**
   * Determines whether the layout section is horizontal or vertical.
   * @private
   */
  private isHorizontal(): boolean {
    return this.orientation === "horizontal";
  }

  /**
   * Returns whether we should be saving & loading from state.
   * @private
   */
  private isStateful(): boolean {
    return this.stateKey !== null && this.stateKey !== undefined;
  }

  /**
   * Saves the current size and visibility of panes in storage.
   * @private
   */
  private saveState() {
    const storage = this.getStorage();

    const firstPaneSize = this.firstPanePixelSize / this.resizeModel.sectionSize;
    const lastPaneSize = this.lastPanePixelSize / this.resizeModel.sectionSize;

    let stateData: SavedState = {
      firstPaneSize: firstPaneSize,
      lastPaneSize: lastPaneSize,
      firstPaneVisible: this.firstPaneVisible,
      lastPaneVisible: this.lastPaneVisible
    };

    storage.setItem( this.stateKey, JSON.stringify( stateData ) );
  }

  /**
   * Restores the size and visibility of panes from the saved state.
   * @private
   */
  private restoreState(): boolean {
    const storage = this.getStorage();
    const stateString = storage.getItem( this.stateKey );

    if( stateString ) {
      let stateData: SavedState = JSON.parse( stateString );
      this.firstPaneSize = stateData.firstPaneSize;
      this.lastPaneSize = stateData.lastPaneSize;
      this.firstPaneVisible = stateData.firstPaneVisible;
      this.lastPaneVisible = stateData.lastPaneVisible;
      return true;
    }

    return false;
  }

  /**
   * Returns either local storage or session storage, depending on which storage method is selected.
   * @private
   */
  private getStorage(): Storage {
    return this.stateStorage === "local"
      ? this.window.localStorage
      : this.window.sessionStorage;
  }

}

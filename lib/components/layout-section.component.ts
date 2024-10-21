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
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewChildren
} from "@angular/core";
import { FirstPane } from "../directives/first-pane.directive";
import { LastPane } from "../directives/last-pane.directive";
import { MiddlePane } from "../directives/middle-pane.directive";
import { Constants, LayoutOrientation, StateStorage } from "../models/layout.model";

type VoidListener = VoidFunction | null | undefined;

type PaneType = "first" | "last";

interface SavedState {
  firstPaneSize?: number;
  lastPaneSize?: number;
  firstPaneVisible?: boolean;
  lastPaneVisible?: boolean;
}

interface GutterStyle {
  width?: string;
  height?: string;
  borderRadius: string;
}

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
    ] ),
    trigger( "toggleButton", [
      state(
        "*",
        style( {
          width: "{{ toggleWidth }}",
          height: "{{ toggleHeight }}"
        } ),
        {
          params: {
            toggleWidth: "",
            toggleHeight: ""
          }
        }
      ),
      transition( "false <=> true", animate( "0.2s ease-in-out" ) )
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
  @Input() orientation: LayoutOrientation = Constants.horizontalOrientation;

  /**
   * The size in pixels of the resize bar (the gutter).
   */
  @Input() gutterSize: number;

  /**
   * The size in pixels of the resize bar toggle button.
   */
  @Input() gutterToggleSize: number;

  /**
   * The size in pixels of the resize bar toggle button when the pane is closed.
   */
  @Input() gutterToggleSizeClosed: number;

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

  /**
   * Clears the storage being used for save state, for unit test purposes.
   */
  @Input() clearStorage: boolean = false;

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

  protected firstPaneTemplate: TemplateRef<any>;
  protected middlePaneTemplate: TemplateRef<any>;
  protected lastPaneTemplate: TemplateRef<any>;

  // The visibility state of the collapsible panes
  protected firstPaneVisible: boolean = true;
  protected lastPaneVisible: boolean = true;

  protected readonly Constants = Constants;

  // Variables to track pane resizing
  private resizeModel = {
    sectionSize: null as number,
    startPos: null as number,
    firstPaneSize: null as number,
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

  // The actual size in pixels of gutter toggles
  private gutterTogglePixelSize: number;
  private gutterTogglePixelSizeClosed: number;

  private window: Window;

  // Elements for the section, panes, and gutter
  private sectionEl: HTMLElement;
  private firstPaneEl: HTMLElement;
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
    const sectionEl: HTMLElement = this.elRef.nativeElement.querySelector( Constants.sectionSelector );
    const sectionSize = this.getSectionSize( sectionEl );
    this.resizeModel.sectionSize = sectionSize;
    this.calculatePixelSizes( sectionSize );
    this.calculateToggleSizes( sectionEl );
  }

  ngAfterViewInit() {
    // Pull elements from ViewChildren
    this.sectionEl = this.sectionViewChild.nativeElement;
    this.firstPaneEl = this.firstPaneViewChild?.nativeElement;
    this.lastPaneEl = this.lastPaneViewChild?.nativeElement;

    this.gutterViewChildren.forEach( gutterElRef => {
      const gutterEl: HTMLElement = gutterElRef.nativeElement;
      if( this.hasStyleClass( gutterEl, Constants.gutterFirstClass ) ) {
        this.firstGutterEl = gutterEl;
      }
      else {
        this.lastGutterEl = gutterEl;
      }
    } );

    new ResizeObserver( () => this.onSectionResize() )
      .observe( this.sectionEl );
  }

  getPaneSize( pane: PaneType ): string {
    let paneVisible: boolean;
    let paneSize: number;

    if( pane === Constants.paneTypeFirst ) {
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
    if( event.button !== 0 || !paneVisible || !this.hasStyleClass( event.target as HTMLElement, Constants.gutterClass ) ) {
      return;
    }

    // Initialize variables for handling the resize
    this.resizeModel.sectionSize = this.getSectionSize( this.sectionEl );
    this.resizeModel.startPos = this.isHorizontal() ? event.pageX : event.pageY;
    this.resizeModel.firstPaneSize = this.calculatePaneSize( this.firstPaneEl );
    this.resizeModel.lastPaneSize = this.calculatePaneSize( this.lastPaneEl );
    this.resizeModel.paneResizing = pane;

    // Update element classes for resize
    const gutterEl = pane === Constants.paneTypeFirst ? this.firstGutterEl : this.lastGutterEl;
    this.addStyleClass( this.sectionEl, Constants.paneResizingClass );
    this.addStyleClass( gutterEl, Constants.gutterResizingClass );

    this.bindMouseListeners();
  }

  /**
   * Toggles the visibility of the selected pane.
   * @param {PaneType} pane
   */
  onGutterHandleClick( pane: PaneType ) {
    if( pane === Constants.paneTypeFirst ) {
      this.firstPaneVisible = !this.firstPaneVisible;
    }
    else {
      this.lastPaneVisible = !this.lastPaneVisible;
    }

    if( this.isStateful() ) {
      this.saveState();
    }
  }

  getToggleButtonWidth( visible: boolean ): string {
    const size = visible ? this.gutterTogglePixelSize : this.gutterTogglePixelSizeClosed;
    if( !this.isHorizontal() ) {
      return `${ size }px`;
    }
    return `${ this.gutterSize }px`;
  }

  getToggleButtonHeight( visible: boolean ): string {
    const size = visible ? this.gutterTogglePixelSize : this.gutterTogglePixelSizeClosed;
    if( this.isHorizontal() ) {
      return `${ size }px`;
    }
    return `${ this.gutterSize }px`;
  }

  /**
   * Returns styling for the gutter handle, depending on the orientation of the layout.
   */
  getGutterStyle(): GutterStyle {
    const borderRadius = Math.round( this.gutterSize / 2 );

    return {
      borderRadius: `${ borderRadius }px`
    };
  }

  /**
   * Returns the CSS classes for the gutter element.
   * @param {PaneType} pane
   */
  getGutterClass( pane: PaneType ): string {
    return `${ Constants.gutterClass } gutter-${ pane } ${ Constants.layoutComponentClass }`;
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
    const newPos = this.isHorizontal()
      ? event.pageX - this.resizeModel.startPos
      : event.pageY - this.resizeModel.startPos;

    let newFirstPaneSize = this.firstPanePixelSize;
    let newLastPaneSize = this.lastPanePixelSize;


    if( this.resizeModel.paneResizing === Constants.paneTypeFirst ) {
      newFirstPaneSize += newPos;
    }
    else {
      newLastPaneSize -= newPos;
    }

    const gutterEl = this.resizeModel.paneResizing === Constants.paneTypeFirst ? this.firstGutterEl : this.lastGutterEl;

    // If the new sizes for panes are valid, update the pane sizes (which automatically updates the elements)
    if( this.validateResize( newFirstPaneSize, newLastPaneSize ) ) {
      if( this.hasStyleClass( gutterEl, Constants.invalidResizeClass ) ) {
        this.removeStyleClass( gutterEl, Constants.invalidResizeClass );
      }

      this.firstPanePixelSize = newFirstPaneSize;
      this.lastPanePixelSize = newLastPaneSize;
      this.resizeModel.startPos = this.isHorizontal() ? event.pageX : event.pageY;
    }
    // When the resize is invalid, adjust the gutter to indicate it's reached the limit
    else {
      const gutterEl = this.resizeModel.paneResizing === Constants.paneTypeFirst ? this.firstGutterEl : this.lastGutterEl;
      if( !this.hasStyleClass( gutterEl, Constants.invalidResizeClass ) ) {
        this.addStyleClass( gutterEl, Constants.invalidResizeClass );
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

    const gutterEl = this.resizeModel.paneResizing === Constants.paneTypeFirst ? this.firstGutterEl : this.lastGutterEl;
    this.removeStyleClass( gutterEl, Constants.gutterResizingClass );
    this.removeStyleClass( this.sectionEl, Constants.paneResizingClass );

    this.resetResizeModel();
    this.unbindMouseListeners();
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
   * Calculates the size in pixels of the gutter toggle button.
   * @param {HTMLElement} sectionEl
   * @private
   */
  private calculateToggleSizes( sectionEl: HTMLElement ) {
    const gutterSize = this.isHorizontal() ? this.getElementHeight( sectionEl ) : this.getElementWidth( sectionEl ) ;

    this.gutterTogglePixelSize = this.convertToggleSizeToPixels( gutterSize, this.gutterToggleSize );
    this.gutterTogglePixelSizeClosed = this.convertToggleSizeToPixels( gutterSize, this.gutterToggleSizeClosed );
  }

  /**
   * Converts the size of the gutter toggle button into pixels. Sizes under 1 are assumed to be a
   * percentage, while sizes above 1 are assumed to be in pixels.
   * @param {number} sectionSize
   * @param {number} toggleSize
   * @private
   */
  private convertToggleSizeToPixels( sectionSize: number, toggleSize: number ): number {
    // When the toggle size is given as a decimal, assume it's a percentage
    if( toggleSize < 1 ) {
      return Math.round( toggleSize * sectionSize );
    }

    // Otherwise assume the toggle size is given in pixels
    return toggleSize;
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
      ? this.getElementOuterWidth( paneEl, true )
      : this.getElementOuterHeight( paneEl, true ) ) ) / this.resizeModel.sectionSize;
  }

  /**
   * React to the section being resized and resize panes to maintain their current size as a percentage.
   */
  private onSectionResize() {
    if( !this.resizeModel.sectionSize ) {
      return;
    }

    const newSize = this.getSectionSize();

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
   * Returns the section size based on the given element and orientation.
   * @param {HTMLElement} sectionEl
   * @private
   */
  private getSectionSize( sectionEl: HTMLElement = this.sectionEl ): number {
    return this.isHorizontal()
      ? this.getElementWidth( sectionEl )
      : this.getElementHeight( sectionEl );
  }

  /**
   * Listens for the movement of the mouse and the release of the mouse button.
   * @private
   */
  private bindMouseListeners() {
    if( !this.resizeModel.mouseMoveListener ) {
      this.resizeModel.mouseMoveListener = this.renderer.listen(
        this.document,
        Constants.mouseMoveEvent,
        event => this.onResize( event )
      );
    }

    if( !this.resizeModel.mouseUpListener ) {
      this.resizeModel.mouseUpListener = this.renderer.listen(
        this.document,
        Constants.mouseUpEvent,
        () => this.resizeEnd()
      );
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
    this.resizeModel.startPos = null;
    this.resizeModel.firstPaneSize = null;
    this.resizeModel.lastPaneSize = null;
    this.resizeModel.paneResizing = null;
  }

  /**
   * Determines whether the layout section is horizontal or vertical.
   * @private
   */
  private isHorizontal(): boolean {
    return this.orientation === Constants.horizontalOrientation;
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

    const stateData: SavedState = {
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
    if( this.clearStorage ) {
      storage.clear();
    }

    const stateString = storage.getItem( this.stateKey );

    if( stateString ) {
      const stateData: SavedState = JSON.parse( stateString );
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
    return this.stateStorage === Constants.storageLocal
      ? this.window.localStorage
      : this.window.sessionStorage;
  }

  /**
   * Returns the width of the given element, accounting for padding and borders.
   * @param {HTMLElement} element
   * @private
   */
  private getElementWidth( element: HTMLElement ): number {
    let width = element.offsetWidth;
    const style = getComputedStyle( element );

    width -= parseFloat( style.paddingLeft ) + parseFloat( style.paddingRight ) + parseFloat( style.borderLeftWidth ) + parseFloat( style.borderRightWidth );
    return width;
  }

  /**
   * Returns the height of the given element, accounting for padding and borders.
   * @param {HTMLElement} element
   * @private
   */
  private getElementHeight( element: HTMLElement ): number {
    let height = element.offsetHeight;
    const style = getComputedStyle( element );

    height -= parseFloat( style.paddingTop ) + parseFloat( style.paddingBottom ) + parseFloat( style.borderTopWidth ) + parseFloat( style.borderBottomWidth );
    return height;
  }

  /**
   * Returns the outer width of the given element, optionally accounting for margins.
   * @param {HTMLElement} element
   * @param {boolean} includeMargin
   * @private
   */
  private getElementOuterWidth( element: HTMLElement, includeMargin: boolean = false ): number {
    let width = element.offsetWidth;

    if( includeMargin ) {
      const style = getComputedStyle( element );
      width += parseFloat( style.marginLeft ) + parseFloat( style.marginRight );
    }

    return width;
  }

  /**
   * Returns the outer height of the given element, optionally accounting for margins.
   * @param {HTMLElement} element
   * @param {boolean} includeMargin
   * @private
   */
  private getElementOuterHeight( element: HTMLElement, includeMargin: boolean = false ): number {
    let height = element.offsetHeight;

    if( includeMargin ) {
      const style = getComputedStyle( element );
      height += parseFloat( style.marginTop ) + parseFloat( style.marginBottom );
    }

    return height;
  }

  /**
   * Returns whether the given element has the given CSS class.
   * @param {HTMLElement} element
   * @param {string} className
   * @private
   */
  private hasStyleClass( element: HTMLElement, className: string ): boolean {
    if( element && className ) {
      if( element.classList ) {
        return element.classList.contains( className );
      }
      else {
        return new RegExp( "(^| )" + className + "( |$)", "gi" ).test( element.className );
      }
    }

    return false;
  }

  /**
   * Adds the given CSS class to the given element.
   * @param {HTMLElement} element
   * @param {string} className
   * @private
   */
  private addStyleClass( element: HTMLElement, className: string ) {
    if( element && className ) {
      if( element.classList ) {
        element.classList.add( className );
      }
      else {
        element.className += " " + className;
      }
    }
  }

  /**
   * Removes the given CSS class from the given element.
   * @param {HTMLElement} element
   * @param {string} className
   * @private
   */
  private removeStyleClass( element: HTMLElement, className: string ) {
    if( element && className ) {
      if( element.classList ) {
        element.classList.remove( className );
      }
      else {
        element.className = element.className.replace( new RegExp( "(^|\\b)" + className.split( " " ).join( "|" ) + "(\\b|$)", "gi" ), " " );
      }
    }
  }

}

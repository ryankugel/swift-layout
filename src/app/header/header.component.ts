import { NgOptimizedImage, NgTemplateOutlet } from "@angular/common";
import { Component, ElementRef, HostListener, Input, OnInit } from "@angular/core";

type Theme = "blue" | "green" | "magenta" | "red";

@Component( {
  selector: "swift-layout-demo-header",
  templateUrl: "header.component.html",
  styleUrl: "header.component.css",
  imports: [
    NgOptimizedImage,
    NgTemplateOutlet
  ],
  standalone: true
} )
export class HeaderComponent implements OnInit {

  @Input() title: string;

  protected head: HTMLHeadElement;
  protected styleLink: HTMLLinkElement;
  protected selectedTheme: Theme = "blue";

  protected themePickerVisible = false;

  @HostListener( "document:click", [ "$event" ] )
  onClick( event: PointerEvent ) {
    const overlayElement = this.elRef.nativeElement.querySelector( ".theme-picker-overlay" );

    if( overlayElement ) {
      if( !overlayElement.contains( event.target ) ) {
        this.themePickerVisible = false;
      }
    }
  }

  constructor( private elRef: ElementRef ) {
  }

  ngOnInit() {
    this.head = document.getElementsByTagName( "head" )[0];
    this.styleLink = this.createStyleLink();
    this.head.appendChild( this.styleLink );

    this.setTheme( "blue" );
  }

  protected toggleThemePicker() {
    this.themePickerVisible = !this.themePickerVisible;
  }

  protected setTheme( theme: Theme ) {
    const link = this.createStyleLink();
    link.href = `/assets/theme-${ theme }.css`;

    this.styleLink.replaceWith( link );
    this.styleLink = link;
    this.selectedTheme = theme;
    this.themePickerVisible = false;
  }

  private createStyleLink(): HTMLLinkElement {
    const link = document.createElement( "link" );
    link.rel = "stylesheet";

    return link;
  }

}

import { Component } from "@angular/core";
import { LayoutComponent } from "../../../lib/components/layout.component";
import { Pane } from "../../../lib/directives/pane.directive";
import { HeaderComponent } from "../header/header.component";

@Component( {
  selector: "swift-layout-demo",
  templateUrl: "layout-demo.component.html",
  styleUrl: "layout-demo.component.css",
  standalone: true,
  imports: [
    LayoutComponent,
    Pane,
    HeaderComponent
  ]
} )
export class LayoutDemoComponent {}

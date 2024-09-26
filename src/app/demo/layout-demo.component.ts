import { Component } from "@angular/core";
import { LayoutComponent } from "../../../lib/components/layout.component";
import { Pane } from "../../../lib/directives/pane.directive";

@Component( {
  selector: "swift-layout-demo",
  templateUrl: "layout-demo.component.html",
  styleUrl: "layout-demo.component.css",
  standalone: true,
  imports: [
    LayoutComponent,
    Pane
  ]
} )
export class LayoutDemoComponent {}

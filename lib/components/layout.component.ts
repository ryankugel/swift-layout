import { NgTemplateOutlet } from "@angular/common";
import { AfterContentInit, Component, ContentChildren, QueryList, TemplateRef } from "@angular/core";
import { FirstPane } from "../directives/first-pane.directive";
import { LastPane } from "../directives/last-pane.directive";
import { MiddlePane } from "../directives/middle-pane.directive";
import { Pane } from "../directives/pane.directive";
import { LayoutSectionComponent } from "./layout-section.component";

@Component( {
  selector: "swift-layout",
  templateUrl: "layout.component.html",
  styleUrl: "layout.component.css",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FirstPane,
    MiddlePane,
    LastPane,
    LayoutSectionComponent
  ]
} )
export class LayoutComponent implements AfterContentInit {

  @ContentChildren( Pane ) templates: QueryList<Pane>;

  centerPaneTemplate: TemplateRef<any>;
  topPaneTemplate: TemplateRef<any>;
  bottomPaneTemplate: TemplateRef<any>;
  leftPaneTemplate: TemplateRef<any>;
  rightPaneTemplate: TemplateRef<any>;

  ngAfterContentInit() {
    this.templates.forEach( item => {
      switch( item.getPaneRegion() ) {
        case "center":
          this.centerPaneTemplate = item.template;
          break;
        case "top":
          this.topPaneTemplate = item.template;
          break;
        case "bottom":
          this.bottomPaneTemplate = item.template;
          break;
        case "left":
          this.leftPaneTemplate = item.template;
          break;
        case "right":
          this.rightPaneTemplate = item.template;
          break;
      }
    } );
  }

}

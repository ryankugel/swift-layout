import { Directive, Input, TemplateRef } from "@angular/core";
import { PaneRegion } from "../models/layout.model";

@Directive( {
  selector: "[middlePane]",
  standalone: true
} )
export class MiddlePane {

  @Input( "middlePane" ) middlePane: PaneRegion;

  constructor( public template: TemplateRef<any> ) {
  }

}

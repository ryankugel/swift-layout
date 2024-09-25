import { Directive, Input, TemplateRef } from "@angular/core";
import { PaneRegion } from "../models/layout.model";

@Directive( {
  selector: "[lastPane]",
  standalone: true
} )
export class LastPane {

  @Input( "lastPane" ) lastPane: PaneRegion;

  constructor( public template: TemplateRef<any> ) {
  }

}

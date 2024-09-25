import { Directive, Input, TemplateRef } from "@angular/core";
import { PaneRegion } from "../models/layout.model";

@Directive( {
  selector: "[firstPane]",
  standalone: true
} )
export class FirstPane {

  @Input( "firstPane" ) firstPane: PaneRegion;

  constructor( public template: TemplateRef<any> ) {
  }

}

import { Directive, Input, TemplateRef } from "@angular/core";
import { PaneRegion } from "../models/layout.model";

@Directive( {
  selector: "[pane]",
  standalone: true
} )
export class Pane {

  @Input( "pane" ) pane: PaneRegion;

  // TODO: RYAN - can we get a type for this or no?
  constructor( public template: TemplateRef<any> ) {
  }

  getPaneRegion(): PaneRegion {
    return this.pane!;
  }

}

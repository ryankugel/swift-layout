import { Directive, Input, TemplateRef } from "@angular/core";
import { PaneRegion } from "../models/layout.model";

@Directive( {
  selector: "[pane]",
  standalone: true
} )
export class Pane {

  @Input( "pane" ) pane: PaneRegion;

  @Input( "size" ) size: number = 25;

  @Input( "minSize" ) minSize: number = 5;

  @Input( "maxSize" ) maxSize: number = 50;

  constructor( public template: TemplateRef<any> ) {
  }

  getPaneRegion(): PaneRegion {
    return this.pane!;
  }

}

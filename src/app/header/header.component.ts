import { Component, Input } from "@angular/core";

@Component( {
  selector: "swift-layout-demo-header",
  templateUrl: "header.component.html",
  styleUrl: "header.component.css",
  standalone: true,
  imports: []
} )
export class HeaderComponent {

  @Input() title: string;

}

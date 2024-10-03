import { NgOptimizedImage } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component( {
  selector: "swift-layout-demo-header",
  templateUrl: "header.component.html",
  styleUrl: "header.component.css",
  imports: [
    NgOptimizedImage
  ],
  standalone: true
} )
export class HeaderComponent {

  @Input() title: string;

}

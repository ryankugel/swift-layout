import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { LayoutDemoComponent } from "./app/demo/layout-demo.component";

bootstrapApplication( LayoutDemoComponent, appConfig )
  .catch( ( err ) => console.error( err ) );

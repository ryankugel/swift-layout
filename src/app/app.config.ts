import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom( [ BrowserAnimationsModule ] ),
    provideZoneChangeDetection( { eventCoalescing: true } ),
    provideRouter( routes ) ]
};

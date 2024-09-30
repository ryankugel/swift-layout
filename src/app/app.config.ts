import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom( [ BrowserAnimationsModule ] ),
    provideZoneChangeDetection( { eventCoalescing: true } ),
  ]
};

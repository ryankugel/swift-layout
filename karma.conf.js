/* eslint-disable @typescript-eslint/no-require-imports */

const argv = require( "yargs" ).argv;

function getCommandLineArg( argName, defaultValue ) {
  let result = defaultValue;
  if( argv[ argName ] !== undefined ) {
    result = argv[ argName ];
  }
  return result;
}

module.exports = function( config ) {
  const headless = !getCommandLineArg( "watch", false );

  const debugOptions = {
    showTestLabels: false,
    browserConsoleLogLevel: "error",
    captureBrowserLogging: true,
    captureBrowserLoggingPhantom: false,
    captureConsole: true,
    useCustomErrorFormat: true,
    customErrorLengthLimit: 600,
    enablePhantomDebug: false,
    ignoreSkippedTests: true,
    headless: headless
  };

  config.set( {
    basePath: "",
    frameworks: [ "jasmine", "@angular-devkit/build-angular" ],
    plugins: [
      require( "karma-jasmine" ),
      require( "karma-chrome-launcher" ),
      require( "karma-mocha-reporter" ),
      require( "@angular-devkit/build-angular/plugins/karma" )
    ],
    client: {
      clearContext: false
    },
    reporters: [ "mocha" ],
    mochaReporter: {
      ignoreSkipped: debugOptions.ignoreSkippedTests
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [ "Chrome_incognito" ],
    singleRun: false,
    files: [
      "lib/assets/swift-layout.css"
    ],
    browserConsoleLogOptions: {
      terminal: debugOptions.captureBrowserLogging,
      level: debugOptions.browserConsoleLogLevel
    },
    formatError: function( error ) {
      try {
        if( error.length > debugOptions.customErrorLengthLimit ) {
          console.error( " " );
          console.error( "(Size of the error in the log can be adjusted in Karma config `formatError` function)" );
          const trimmedError = error.toString().trim().substring( 0, debugOptions.customErrorLengthLimit ) + "...";
          console.error( trimmedError );
          console.error( " " );
          return trimmedError;
        }
      }
      catch ( e ) {
        console.error( e );
      }
      return error;
    },
    reportSlowerThan: 0,
    captureTimeout: 180000,
    processKillTimeout: 10000,
    browserSocketTimeout: 30000,
    browserDisconnectTimeout: 6000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 30000,
    customLaunchers: {
      Chrome_incognito: {
        base: "Chrome",
        flags: [
          "--incognito",
          "--window-size=1920,1080",
          "--no-default-browser-check",
          "--no-first-run",
          "--disable-default-apps",
          "--disable-popup-blocking",
          "--disable-translate",
          "--disable-background-timer-throttling",
          "--disable-device-discovery-notifications"
        ]
      },
      Chrome_headless: {
        base: "ChromeHeadless",
        flags: [ "--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080" ]
      }
    }
  } );

  if( debugOptions.headless ) {
    process.env.CHROME_BIN = require( "puppeteer" ).executablePath();
    config.browsers = [ "Chrome_headless" ];
    config.singleRun = true;
    config.browserNoActivityTimeout = 90000;
    config.reportSlowerThan = 0;
    config.browserConsoleLogOptions.terminal = debugOptions.captureBrowserLoggingPhantom;
    console.log( "" );
    console.log( "Karma configured for headless test run." );
  }
  else {
    config.browserNoActivityTimeout = 3600000;
    console.log( "" );
    console.log( "Karma configured for watch test run." );
  }
};

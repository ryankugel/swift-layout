# Swift Layout

A simple layout library for Angular, designed to mimic some of the functionality of the [jQuery UI Layout plugin](https://plugins.jquery.com/layout/).

## Getting started

### Installation
```shell
  npm install swift-layout
```

### Importing Styles
Swift Layout includes a single CSS file containing the default styles for the library.
This CSS can either be imported in `angular.json` or `styles.css`.

#### angular.json
```json
"styles": [
  "node_modules/swift-layout/resources/swift-layout.css"
]
```

#### styles.css
```css
@import "node_modules/swift-layout/resources/swift-layout.css";
```

### Usage

In its simplest form, Swift Layout can be used to set up multiple resizable panes in a layout.

#### Minimal example
```angular2html
<swift-layout>
  <ng-template pane="left">
    <div class="pane-content-demo">Left Pane</div>
  </ng-template>

  <ng-template pane="right">
    <div class="pane-content-demo">Right Pane</div>
  </ng-template>

  <ng-template pane="center">
    <div class="pane-content-demo">Center Pane</div>
  </ng-template>

  <ng-template pane="top">
    <div class="pane-content-demo">Top Pane</div>
  </ng-template>

  <ng-template pane="bottom">
    <div class="pane-content-demo">Left Pane</div>
  </ng-template>
</swift-layout>
```

##### *Result*
<img src="screenshots/Minimal_Example.png" alt="Minimal example of Swift Layout" style="width: 900px" />

A variety of options are provided by Swift Layout:
- Styles can be added to the layout using the `style` option.
- Panes can be mixed and matched to set up the desired layout. Only the `center` pane is required.
- The initial, minimum, and maximum sizes of panes can be defined through the `size`, `minSize`, and `maxSize` options, respectively.
These values are set as a percentage.
  - A size of 30% can be set as `[size]="30"` or `[size]="0.3"`
- The size of the resize bar in pixels can be set using the `gutterSize` option.
- Persisting the layout's state can be done by setting the `stateKey`. This key must be unique.
  - Layout state is persisted in either `localStorage` or `sessionStorage` depending on the value of the `stateStorage` option (defaults to `sessionStorage`).

#### Detailed example
```angular2html
<swift-layout stateKey="exampleLayout" [gutterSize]="16" stateStorage="local"
              [style]="{ backgroundColor: '#dddddd', border: '1px solid #b6bbc3', borderRadius: '2em' }">
  <ng-template pane="left" [size]="30" [minSize]="10" [maxSize]="45">
    <div class="pane-content-demo">Left Pane</div>
  </ng-template>

  <ng-template pane="center">
    <div class="pane-content-demo">Center Pane</div>
  </ng-template>

  <ng-template pane="bottom" [size]="20" [minSize]="10" [maxSize]="45">
    <div class="pane-content-demo">Bottom Pane</div>
  </ng-template>
</swift-layout>
```

##### *Result*
<img src="screenshots/Detailed_Example.png" alt="Minimal example of Swift Layout" style="width: 900px" />

---

## Styling
The following is a list of CSS classes used by Swift Layout.

| Name                                                      | Description                                           |
|-----------------------------------------------------------|-------------------------------------------------------|
| `.swift-layout`                                           | Top-level container for the layout                    |
| `.layout-pane-content`                                    | Container of an individual pane                       |
| `.layout-pane-gutter`                                     | The pane resize bar                                   |
| `.layout-pane-gutter.pane-gutter-resizing`                | The resize bar while resizing a pane                  |
| `.layout-pane-gutter.pane-gutter-resizing.invalid-resize` | The resize bar when a resize exceeds the min/max size |
| `.layout-pane-gutter.gutter-collapsed`                    | The resize bar when the pane is closed                |
| `.layout-pane-gutter-toggle`                              | The resize bar button to show/hide a pane             |

---

## Credits
The resizing of panes was largely adapted from [PrimeNG's Splitter component](https://github.com/primefaces/primeng/tree/master/src/app/components/splitter).

# doodle-canvas



<!-- Auto Generated Below -->


## Overview

Freehand doodling + text overlay for an SVG or bitmap image. The background is a plain <img>
(CSS object-fit handles contain/cover); pen strokes are <path> elements in an <svg> layer;
placed text is a separate absolutely-positioned HTML layer (SVG <text> can't hold a constant
on-screen font size under the svg's own non-uniform viewBox stretch the way
vector-effect="non-scaling-stroke" does for line width, so text gets its own layer instead).
Both layers write into the same `elements` list, so undo/redo/clear are just array operations,
not pixel manipulation.

## Properties

| Property         | Attribute          | Description                                                                                                                                                      | Type                                            | Default                                                                                    |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `colors`         | --                 |                                                                                                                                                                  | `string[]`                                      | `['#1c1c1e', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#af52de', '#ffffff']` |
| `crossOrigin`    | `cross-origin`     | Set to 'anonymous' when imageSrc is cross-origin and you need exportPng() to work - an un-annotated cross-origin image taints the canvas and toDataURL() throws. | `"anonymous" \| "use-credentials" \| undefined` | `undefined`                                                                                |
| `disabled`       | `disabled`         |                                                                                                                                                                  | `boolean`                                       | `false`                                                                                    |
| `fit`            | `fit`              | Mirrors CSS object-fit for how imageSrc is scaled into the stage.                                                                                                | `"contain" \| "cover"`                          | `'contain'`                                                                                |
| `fontSize`       | `font-size`        |                                                                                                                                                                  | `number`                                        | `20`                                                                                       |
| `imageAlt`       | `image-alt`        |                                                                                                                                                                  | `string`                                        | `''`                                                                                       |
| `imageSrc`       | `image-src`        | URL of the base image to doodle over - works for both raster (png/jpg) and SVG sources, since both render fine in a plain <img>.                                 | `string \| undefined`                           | `undefined`                                                                                |
| `maxFontSize`    | `max-font-size`    |                                                                                                                                                                  | `number`                                        | `48`                                                                                       |
| `maxStrokeWidth` | `max-stroke-width` |                                                                                                                                                                  | `number`                                        | `28`                                                                                       |
| `minFontSize`    | `min-font-size`    |                                                                                                                                                                  | `number`                                        | `12`                                                                                       |
| `minStrokeWidth` | `min-stroke-width` |                                                                                                                                                                  | `number`                                        | `2`                                                                                        |
| `showToolbar`    | `show-toolbar`     |                                                                                                                                                                  | `boolean`                                       | `true`                                                                                     |
| `strokeColor`    | `stroke-color`     |                                                                                                                                                                  | `string`                                        | `DEFAULT_COLORS[1]`                                                                        |
| `strokeWidth`    | `stroke-width`     |                                                                                                                                                                  | `number`                                        | `6`                                                                                        |


## Events

| Event          | Description                                                                                                                                                          | Type                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `doodleChange` | Fires after any mutation (stroke or text committed, clear, undo, redo, text moved) so a host can drive its own save/undo button state without polling getSnapshot(). | `CustomEvent<StrokeSnapshot>` |


## Methods

### `clear() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `exportPng(opts?: ExportOptions) => Promise<string>`

Rasterizes the doodle at the stage's current on-screen size and returns it as a PNG data
URL. Draws the background straight from the live <img> (not through exportSvg()'s <image
href>) - that href is only reliably resolved when the SVG lives in a real document, not when
it's rasterized standalone via a data: URI, which is exactly what happens here.

#### Parameters

| Name   | Type            | Description |
| ------ | --------------- | ----------- |
| `opts` | `ExportOptions` |             |

#### Returns

Type: `Promise<string>`



### `exportSvg(opts?: ExportOptions) => Promise<string>`

Serializes the doodle - background image, strokes, and text - into standalone SVG markup.
Strokes are nested in their own nested <svg> carrying the 0-100 viewBox stretch; text is
placed directly in the outer, unscaled pixel space so glyphs never get stretched.

#### Parameters

| Name   | Type            | Description |
| ------ | --------------- | ----------- |
| `opts` | `ExportOptions` |             |

#### Returns

Type: `Promise<string>`



### `getSnapshot() => Promise<StrokeSnapshot>`



#### Returns

Type: `Promise<StrokeSnapshot>`



### `redo() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `undo() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

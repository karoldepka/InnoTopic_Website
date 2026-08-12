# doodle-canvas



<!-- Auto Generated Below -->


## Overview

Freehand doodling overlay for an SVG or bitmap image. The background is a plain <img> (CSS
object-fit handles contain/cover), and doodle strokes are <path> elements in an <svg> layered
on top - each stroke is stored as its own list of points, so undo/redo/clear are just array
operations on `strokes`, not pixel manipulation.

## Properties

| Property         | Attribute          | Description                                                                                                                                                      | Type                                            | Default                                                                                    |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `colors`         | --                 |                                                                                                                                                                  | `string[]`                                      | `['#1c1c1e', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#af52de', '#ffffff']` |
| `crossOrigin`    | `cross-origin`     | Set to 'anonymous' when imageSrc is cross-origin and you need exportPng() to work - an un-annotated cross-origin image taints the canvas and toDataURL() throws. | `"anonymous" \| "use-credentials" \| undefined` | `undefined`                                                                                |
| `disabled`       | `disabled`         |                                                                                                                                                                  | `boolean`                                       | `false`                                                                                    |
| `fit`            | `fit`              | Mirrors CSS object-fit for how imageSrc is scaled into the stage.                                                                                                | `"contain" \| "cover"`                          | `'contain'`                                                                                |
| `imageAlt`       | `image-alt`        |                                                                                                                                                                  | `string`                                        | `''`                                                                                       |
| `imageSrc`       | `image-src`        | URL of the base image to doodle over - works for both raster (png/jpg) and SVG sources, since both render fine in a plain <img>.                                 | `string \| undefined`                           | `undefined`                                                                                |
| `maxStrokeWidth` | `max-stroke-width` |                                                                                                                                                                  | `number`                                        | `28`                                                                                       |
| `minStrokeWidth` | `min-stroke-width` |                                                                                                                                                                  | `number`                                        | `2`                                                                                        |
| `showToolbar`    | `show-toolbar`     |                                                                                                                                                                  | `boolean`                                       | `true`                                                                                     |
| `strokeColor`    | `stroke-color`     |                                                                                                                                                                  | `string`                                        | `DEFAULT_COLORS[1]`                                                                        |
| `strokeWidth`    | `stroke-width`     |                                                                                                                                                                  | `number`                                        | `6`                                                                                        |


## Events

| Event          | Description                                                                                                                                     | Type                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `doodleChange` | Fires after any mutation (stroke finished, clear, undo, redo) so a host can drive its own save/undo button state without polling getSnapshot(). | `CustomEvent<StrokeSnapshot>` |


## Methods

### `clear() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `exportPng(opts?: { includeBackground?: boolean; }) => Promise<string>`

Rasterizes the same markup exportSvg() would produce (background + strokes) at the stage's
current on-screen size, and returns it as a PNG data URL.

#### Parameters

| Name   | Type                                            | Description |
| ------ | ----------------------------------------------- | ----------- |
| `opts` | `{ includeBackground?: boolean \| undefined; }` |             |

#### Returns

Type: `Promise<string>`



### `exportSvg() => Promise<string>`

Serializes the doodle layer - plus the background image as an <image> if one is set - into
standalone, resolution-independent SVG markup.

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

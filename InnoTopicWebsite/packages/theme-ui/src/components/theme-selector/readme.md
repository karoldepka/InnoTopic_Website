# theme-selector



<!-- Auto Generated Below -->


## Overview

Ports Angular's theme-list.page (the preset grid / "theme-selector"). No longer talks to
NgRx - reads/writes

## Events

| Event               | Description                                                                                                                                                                                                                                                                                                                                                | Type                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `themeConfigChange` | Fires the full resulting config whenever a preset is picked - applyThemeConfig() (via setThemeConfig() below, through the store's own onChange->scheduleApply wiring) already re-themes the page as a side effect regardless of whether anyone listens to this; it exists so a host app can react too (e.g. persist the choice in its own settings model). | `CustomEvent<ThemeConfigState>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

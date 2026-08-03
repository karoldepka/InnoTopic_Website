import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AudioVisualizerComponent} from './audio-visualizer/audio-visualizer.component'

@NgModule({
    imports: [
        CommonModule,
        AudioVisualizerComponent
    ],
    exports: [
        AudioVisualizerComponent,
    ]
})
export class AudioModule { }

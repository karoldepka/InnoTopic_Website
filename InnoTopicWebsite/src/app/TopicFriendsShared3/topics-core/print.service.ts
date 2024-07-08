import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  static isPrint = !! JSON.parse(window.localStorage.getItem('isPrint') ?? 'false') // true // hack for now

  constructor() { }
}

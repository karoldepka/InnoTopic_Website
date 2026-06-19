import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderComponent implements OnInit {

  ngOnInit() {
    if (!customElements.get('threed-text')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'assets/dist/threed-text.js';
      document.head.appendChild(script);
    }
  }

}

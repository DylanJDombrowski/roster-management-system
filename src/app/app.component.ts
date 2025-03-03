// src/app/app.component.ts
import { Component } from '@angular/core';
import { MainLayoutComponent } from './shared/components/layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayoutComponent],
  template: `<app-main-layout></app-main-layout>`,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'roster-management-system';
}

import { Routes } from '@angular/router';
import {Login} from './auth/login/login';
import {Signup} from './auth/signup/signup';
import {E404} from './errors/e-404/e-404';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'signup',
    component: Signup
  },
  {
    path: 'test',
    loadComponent: () => import('./api-test/api-test.component').then(c => c.ApiTestComponent)
  },
  {
    path: 'note/create',
    pathMatch: 'full',
    loadComponent: () => import("./note/create-note/create-note").then(c => c.CreateNote),
    canActivate: [authGuard]
  },
  {
    path: 'note/history',
    pathMatch: 'full',
    loadComponent: () => import("./note/note-history/note-history").then(c => c.NoteHistory),
    canActivate: [authGuard]
  },
  {
    path: 'note/:id',
    loadComponent: () => import("./note/view-note/view-note").then(c => c.ViewNote)
  },
  {
    path: '**',
    component: E404
  }
];

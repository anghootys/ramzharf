import {Component, inject, input, OnInit} from '@angular/core';
import {Menu} from 'primeng/menu';
import {MenuItem} from 'primeng/api';
import {Logo} from '../logo/logo';
import {Panel} from 'primeng/panel';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {Menubar} from 'primeng/menubar';
import {Ripple} from 'primeng/ripple';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'page',
  imports: [
    Menu,
    Logo,
    Panel,
    RouterLink,
    RouterLinkActive,
    Menubar,
    Ripple,
  ],
  templateUrl: './page.html',
  styleUrl: './page.scss',
})
export class Page implements OnInit {
  pageHeader = input("");

  private authService = inject(AuthService);
  private router = inject(Router);

  protected username = '';

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.username = user?.username || 'کاربر';
    this.updateMenuItems();
  }

  protected sideMenuItems: MenuItem[] = [
    {
      label: "نویسه‌ها",
      items: [
        {
          label: "نویسه جدید",
          icon: "pi pi-pen-to-square",
          shortcut: "ctrl+n",
          routerLink: "/note/create"
        },
        {
          label: "نویسه‌های من",
          icon: "pi pi-history",
          routerLink: "/note/history",
        }
      ]
    },
    {
      label: "حساب کاربری",
      items: [
        {
          label: "خروج از حساب کاربری",
          icon: "pi pi-sign-out",
          command: () => this.logout()
        }
      ]
    }
  ];

  protected navbarMenuItems: MenuItem[] = [];

  private updateMenuItems(): void {
    this.navbarMenuItems = [
      {
        label: "حساب کاربری" + " " + this.username,
        items: [
          {
            label: "خروج از حساب کاربری",
            icon: "pi pi-sign-out",
            command: () => this.logout()
          }
        ]
      },
    ];
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout API fails, clear local tokens and redirect
        this.authService.clearTokens();
        this.router.navigate(['/login']);
      }
    });
  }

  protected brandName = input("رمـز حـرف");
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  ngOnInit() {
  const element = document.querySelector('modus-navbar') as any;
  element.apps = [ 
    {
      description: 'The One Trimble Design System',
      logoUrl: 'https://modus.trimble.com/favicon.svg',
      name: 'Trimble Modus',
      url: 'https://modus.trimble.com/',
    },
  ];
  element.logoOptions = {
    primary: {
      url: 'https://modus.trimble.com/img/trimble-logo.svg',
      height: 24,
    },
    secondary: { url: 'https://modus.trimble.com/favicon.svg', height: 24 },
  };
  element.dropdownOptions = {
    ariaLabel: 'Project dropdown',
    defaultValue: '2',
    items: [
      { text: 'Project 1', value: '1' },
      { text: 'Project 2', value: '2' },
      { text: 'Project 3', value: '3' },
    ],
  };
  element.profileMenuOptions = {
    avatarUrl: '...',
    email: 'modus_user@trimble.com',
    initials: 'MU',
    signOutText: 'Sign out',
    username: 'Modus User',
    links: [
      {
        id: 'link1',
        display: 'Link 1',
        icon: 'moon',
      },
      {
        id: 'link2',
        display: 'Link 2',
        icon: 'sun',
      },
    ],
  };
}
}

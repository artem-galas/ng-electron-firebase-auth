import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';

import {auth} from 'firebase/app';
import {ElectronService} from 'ngx-electron';

function QueryStringToJSON(s: string) {
  const pairs = s.split('&');

  const result = {};
  pairs.forEach((pair) => {
    const p = pair.split('=');
    result[p[0]] = decodeURIComponent(p[1] || '');
  });

  return JSON.parse(JSON.stringify(result));
}


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constructor(public readonly angularFireAuth: AngularFireAuth,
              private readonly electronService: ElectronService) {
  }

  ngOnInit() {

  }

  login() {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('oauth');
      this.electronService.ipcRenderer.on('oauthToken', (event, args) => {
        console.log(QueryStringToJSON(args));
        const access_token = QueryStringToJSON(args).access_token;
        const credential = auth.GoogleAuthProvider.credential(null, access_token);
        this.angularFireAuth.auth.signInWithCredential(credential);
      });
    } else {
      this.angularFireAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    }
  }

  logout() {
    this.angularFireAuth.auth.signOut();
  }
}

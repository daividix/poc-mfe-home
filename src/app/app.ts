import { Component, signal } from '@angular/core';
import { UserSessionService } from '@poc-mfe/shared';
import { SimpsonsApiService } from './services/simpsons-api.service';

@Component({
  selector: 'home-root',
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App {

  simpsonsCharactersSignal = signal<any[]>([]);
  page = 1;
  pages = 2;
  finding = signal<boolean>(false);
  
  constructor(
    private _userSession: UserSessionService,
    private _simpsonsApi: SimpsonsApiService
  ) {}

  ngOnInit() {
    this.findSimpsonsCharacters();
  }

  findSimpsonsCharacters() {
    if(this.page < this.pages) {
      this.finding.set(true);
      this._simpsonsApi.getCharacters(this.page)
      .subscribe(res => {
        console.log(res);
        this.simpsonsCharactersSignal.update(current => current.concat(res.results));
        this.page++;
        this.pages = res.pages;
        this.finding.set(false);
      });
    }
  }

  get simpsonsCharacters() {
    return this.simpsonsCharactersSignal();
  }

  get user() {
    return this._userSession.user();
  }
}

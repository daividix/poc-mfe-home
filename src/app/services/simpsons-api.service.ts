import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SimpsonsApiService {

  constructor(private http: HttpClient) {

  }

  getCharacters(page?: number) {
    let url = 'https://thesimpsonsapi.com/api/characters';
    if(page) {
      url = url + '?page='+page;
    }
    return this.http.get<any>(url);
  }
}

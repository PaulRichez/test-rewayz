import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
  ) { }

  getData(page: number) {
    return this.http.get<any>(`https://reqres.in/api/users?page=${page}`);
  }
}

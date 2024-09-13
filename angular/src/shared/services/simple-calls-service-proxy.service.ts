import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimpleCallsServiceProxy {
  private baseUrl = 'https://devbots.free.beeceptor.com/devbots/api/members';

  constructor(private http: HttpClient) {}

  getMembers(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }
}

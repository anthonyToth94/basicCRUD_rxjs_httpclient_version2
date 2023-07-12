import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'crud_rxjs_angular';

  //Adatok
  adatok : any[] = [];

  //Változók
  //Hozzáad / Frissites gomb változtatása
  frissitesGomb :boolean = false;

  //Betöltés... div megjelenítése eventeknél
  folymatbanVan = false;

  //Beérkező adatok inputokbol
  titleInput: string = "";
  userIdinput: number | undefined;

  //Frissitendő Index
  valtoztatIndex : any;
  
  feliratkozasok : Subscription[] = []; 

  //http Ezzel éred el a komponensben (de nem kell külön kiírni) dependency injection
  constructor(private http: HttpClient) {
    //this.http = http;
  }

  ngOnInit(): void {

    const feliratkozas1 = this.refresh$.subscribe();
    const feliratkozas2 = this.delete$.subscribe();
    const feliratkozas3 = this.create$.subscribe();
    const feliratkozas4 = this.update$.subscribe();

    this.feliratkozasok.push(feliratkozas1, feliratkozas2, feliratkozas3, feliratkozas4);

    // @ts-ignore
    this.refresh$.next("");
  }

  //Fuggvenyek
  refresh$ = new Subject().pipe(
    tap(() =>{
      this.folymatbanVan = true;
    }),
    switchMap( () => this.http.get('https://jsonplaceholder.typicode.com/posts')),
    catchError( hiba => {
      alert("Hiba történt");
      //Visszatérünk egy olyan Obs.. el ami hasonlo tipusu, az előzővel
      return of([]);
    }),
    //Szoval ide tömb érkezik ezért mindenféleképpen(ures vagy rendes) és a müködést nem akadályozza
    tap( (valasz : any) =>{
      this.folymatbanVan = false;
      this.adatok = valasz;
    }) 
  );
  
  hozzadEvent() {
    const adatok = {
      title: this.titleInput,
      userId: this.userIdinput
    };
    this.titleInput = "";
    this.userIdinput = undefined;
    // @ts-ignore
    this.create$.next(adatok);
  }

  create$ = new Subject().pipe(
    tap(() =>{
      this.folymatbanVan = true;
    }),
    switchMap( (params : any) => this.http.post<any>('https://jsonplaceholder.typicode.com/posts',{
      title: params.title,
      userId : params.userId
    })),
    tap( (response) =>{
      console.log(response);
      this.folymatbanVan = false;
      // @ts-ignore
      this.refresh$.next("");
    }) 
  )

  torlesEvent(event : number){
    // @ts-ignore
    this.delete$.next(event);
  }

  delete$ = new Subject().pipe(
    tap(() =>{
      this.folymatbanVan = true;
    }),
    switchMap( (event) => this.http.delete<any>('https://fakestoreapi.com/products/' + event)),
    tap( (response) =>{
      console.log(response);
      this.folymatbanVan = false;
      // @ts-ignore
      this.refresh$.next("");
    }) 
  );
  
  valtoztatEvent(event : number)
  {
    this.titleInput = this.adatok[event].name;
    this.userIdinput = this.adatok[event].age;

    this.valtoztatIndex = event;

    this.frissitesGomb = true;
  }

  frissitesEvent() {
    const adatok = {
      id: this.valtoztatIndex,
      title: this.titleInput,
      userId: this.userIdinput
    };
  
    this.titleInput = "";
    this.userIdinput = undefined;
    this.frissitesGomb = false;
    
    // @ts-ignore
    this.update$.next(adatok);
  }

  //Ez nem működik
  update$ = new Subject().pipe(
    tap(() =>{
      this.folymatbanVan = true;
    }),
    switchMap( (params : any) => this.http.put<any>('https://jsonplaceholder.typicode.com/posts' + params.id,{
      title: params.title,
      userId : params.userId
    })),
    tap( (response) =>{
      console.log(response);
      this.folymatbanVan = false;
      // @ts-ignore
      this.refresh$.next("");
    }) 
  )

  //Takarító müveletek
  ngOnDestroy(): void {
    for(let feliratkozas of this.feliratkozasok)
    {
      feliratkozas.unsubscribe();
    }
  }
}
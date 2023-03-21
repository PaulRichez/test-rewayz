import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from './api.service';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('search') input!: ElementRef;
  public form!: FormGroup;
  public searchResult: any = [];
  public error!: string;
  public loadingResult = false;

  constructor(private formBuilder: FormBuilder, private apiService: ApiService) {
    this.form = this.formBuilder.group({
      search: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9]*$')]],
    });
    this.form.get('search')?.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(val => {
      this.onSubmit();
    });

  }

  clearValue() {
    this.form.reset();
    this.searchResult = [];
  }

  onSubmit() {
    const search = this.form.get('search')?.value;
    if (!this.form.valid) {
      console.log('min length required (3) ou special char not allowed')
      this.error = search ? 'min length required (3) ou special char not allowed' : '';
      this.searchResult = [];
      return;
    }
    if (this.loadingResult) {
      return;
    }
    this.form.disable();
    this.searchResult = [];
    this.loadingResult = true;

    this.apiService.getData(1).subscribe({
      next: result => {
        this.searchValue(search, result.total_pages) // permet de recherche sur toutes les pages
      },
      error: err => {
        this.form.enable();
        this.error = 'Api Call error'
        this.loadingResult = false;
        this.input.nativeElement.focus();
        console.log('error call API')
      }
    })
  }

  searchValue(q: string, totalPages: number) {
    const call = [];
    for (let i = 0; i < totalPages; i++) { // iteration pour toutes les pages
      call.push(this.apiService.getData(i + 1));
    }
    forkJoin(call).subscribe({
      next: result => {
        this.searchResult = this.findInValues(result.map(result => result.data).flat(), q);
        this.error = '';
        this.form.enable();
        this.loadingResult = false;
        this.input.nativeElement.focus();
      },
      error: err => {
        this.form.enable();
        console.log('error call API')
      }
    })
  }

  findInValues(arr: any, value: string) { // permet une iteration sur tout les champs du tableau
    value = String(value).toLowerCase();
    return arr.filter((o: any) =>
      Object.entries(o).some(entry => {
        if (entry[0] === 'avatar') { // pas de recherche sur le champ image
          return false
        }
        return String(entry[1]).toLowerCase().includes(value)
      })
    );
  }
}


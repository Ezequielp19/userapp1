/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ApklistComponent } from './apklist.component';

describe('ApklistComponent', () => {
  let component: ApklistComponent;
  let fixture: ComponentFixture<ApklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

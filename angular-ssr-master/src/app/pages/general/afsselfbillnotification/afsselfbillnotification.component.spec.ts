import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsselfbillnotificationComponent } from './afsselfbillnotification.component';

describe('AfsselfbillnotificationComponent', () => {
  let component: AfsselfbillnotificationComponent;
  let fixture: ComponentFixture<AfsselfbillnotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsselfbillnotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsselfbillnotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

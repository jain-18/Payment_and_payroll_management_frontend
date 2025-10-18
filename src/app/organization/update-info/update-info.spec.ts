import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateInfo } from './update-info';

describe('UpdateInfo', () => {
  let component: UpdateInfo;
  let fixture: ComponentFixture<UpdateInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

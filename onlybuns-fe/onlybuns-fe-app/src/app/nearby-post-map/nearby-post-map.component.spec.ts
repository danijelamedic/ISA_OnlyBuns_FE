import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyPostMapComponent } from './nearby-post-map.component';

describe('NearbyPostMapComponent', () => {
  let component: NearbyPostMapComponent;
  let fixture: ComponentFixture<NearbyPostMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NearbyPostMapComponent]
    });
    fixture = TestBed.createComponent(NearbyPostMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

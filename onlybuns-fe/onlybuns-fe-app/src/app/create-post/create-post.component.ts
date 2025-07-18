import { Component, OnInit } from '@angular/core';
import { latLng, tileLayer, Map, marker, Marker, LeafletMouseEvent } from 'leaflet';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../services/post.service';
import { LocationService } from '../location.service';
import { icon } from 'leaflet';
import { UserService } from '../services/user.service';

const customIcon = icon({
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  
  map!: Map;
  marker?: Marker;
  postForm!: FormGroup;
  selectedFile: File | null = null;

  successMessage: string = '';
  
locationCache: globalThis.Map<string, any> = new globalThis.Map(); 
//ovde sam imao one konflikte sa mapom, kao da ima neka druga mapa importovana u projektu pa sam morao da uzmem ovu globalnu



  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private locationService: LocationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Inicijalizuj formu
    this.postForm = this.fb.group({
      description: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      address: [''] 
    });

    // Inicijalizuj Leaflet mapu
    this.map = new Map('map').setView([45.2671, 19.8335], 13);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: LeafletMouseEvent) => {
  const { lat, lng } = e.latlng;

  if (this.marker) {
    this.marker.setLatLng([lat, lng]);
  } else {
    this.marker = marker([lat, lng], { icon: customIcon }).addTo(this.map);
  }

  fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
    .then(response => response.json())
    .then(data => {
      if (this.marker) {
        this.marker.bindPopup(data.display_name).openPopup();
      }
      this.postForm.patchValue({
        latitude: lat,
        longitude: lng,
        address: data.display_name || ''  // <-- data je tu dostupno
      });
    })
    .catch(() => {
      if (this.marker) {
        this.marker.bindPopup('Adresa nije pronađena').openPopup();
      }
      this.postForm.patchValue({
        latitude: lat,
        longitude: lng,
        address: ''
      });
    });
});

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      console.log('Izabrana slika:', this.selectedFile.name);
    }
  }

  onSubmit(): void {
  if (this.postForm.invalid) return;

  const description = this.postForm.get('description')?.value;
  const latitude = this.postForm.get('latitude')?.value;
  const longitude = this.postForm.get('longitude')?.value;
  const address = this.postForm.get('address')?.value;

  const locationData = { latitude, longitude, address };

  // Samo za log (nije obavezno za backend keš)
  const locationKey = address.trim().toLowerCase();

  this.locationService.createLocation(locationData).subscribe({
    next: (locationResponse) => {
      if (locationResponse.id === undefined) {
        console.error('Lokacija nema ID.');
        return;
      }

      // Ovo služi samo za frontend log, backend već kešira
      this.locationCache.set(locationKey, locationResponse);
      console.log(`(Frontend) Keširana lokacija za ključ: "${locationKey}"`, locationResponse);

      this.createPost(description, locationResponse.id);
    },
    error: (err) => {
      console.error('Greška prilikom kreiranja lokacije', err);
    }
  });
}


createPost(description: string, locationId: number): void {

      const userId = this.userService.getUserId();

  const postData = {
    description,
    locationId,
    userId
  };

  const formData = new FormData();
  formData.append('post', JSON.stringify(postData));

  if (this.selectedFile) {
    formData.append('imageFile', this.selectedFile, this.selectedFile.name);
  }

  this.postService.createPost(formData).subscribe({
    next: (postResponse) => {
      console.log('Objava uspešno kreirana', postResponse);
      this.successMessage = 'Objava je uspešno kreirana!';
      this.postForm.reset();
      this.marker?.remove();
      this.marker = undefined;
      this.selectedFile = null;

      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    error: (err) => {
      console.error('Greška prilikom kreiranja objave', err);
    }
  });
}

onAddressEntered(): void {
  const address = this.postForm.get('address')?.value;
  if (!address) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    .then(response => response.json())
    .then((results: any[]) => {
      if (results.length === 0) {
        alert('Adresa nije pronađena!');
        return;
      }

      const result = results[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      if (this.marker) {
        this.marker.setLatLng([lat, lon]);
      } else {
        this.marker = marker([lat, lon], { icon: customIcon }).addTo(this.map);
      }

      this.marker.bindPopup(result.display_name).openPopup();

      this.map.setView([lat, lon], 15);

      this.postForm.patchValue({
        latitude: lat,
        longitude: lon,
        address: result.display_name
      });
    })
    .catch(() => {
      alert('Greška pri pronalaženju adrese.');
    });
}



}

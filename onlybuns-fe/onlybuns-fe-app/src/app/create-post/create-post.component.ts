import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PostService } from '../post.service';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';  // Import HttpClient

@Component({
  selector: 'create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {
  postForm: FormGroup;
  map!: L.Map;
  marker!: L.Marker;
  selectedImage: File | null = null;
  address: string = '';  // Variable to hold the address

  constructor(private fb: FormBuilder, private postService: PostService, private http: HttpClient) {
    this.postForm = this.fb.group({
      description: [''],
      id: 1,
      latitude: [null],
      longitude: [null],
      image: [null],
      creationTime: [new Date().toISOString()]
    });
  }

  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    this.map = L.map('map').setView([45.2671, 19.8335], 13); // Initial coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Define the custom red icon
    const redIcon = L.icon({
      iconUrl: 'https://cdn1.iconfinder.com/data/icons/color-bold-style/21/14_2-512.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Create a draggable marker with the red icon
    this.marker = L.marker([45.2671, 19.8335], { 
      draggable: true,
      icon: redIcon
    }).addTo(this.map);

    // Listen for dragend event to update the coordinates and address
    this.marker.on('dragend', () => {
      const { lat, lng } = this.marker.getLatLng();
      this.postForm.patchValue({
        latitude: lat,
        longitude: lng
      });
      this.getAddress(lat, lng);  // Call reverse geocoding on drag end
    });
  }

  // Function to get the address from latitude and longitude
  getAddress(latitude: number, longitude: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    this.http.get<any>(url).subscribe((data) => {
      if (data && data.display_name) {
        this.address = data.display_name;  // Store the address in the variable
      } else {
        this.address = 'Address not found';
      }
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  onSubmit() {
    if (this.postForm.valid) {
      const postData = {
        description: this.postForm.get('description')?.value,
        latitude: this.postForm.get('latitude')?.value,
        longitude: this.postForm.get('longitude')?.value,
        creationTime: this.postForm.get('creationTime')?.value,
        address: this.address  // Add the address to the post data
      };
      
      this.postService.createPost(postData).subscribe({
        next: (response) => console.log("Post created successfully!", response),
        error: (error) => console.error("Error creating post:", error)
      });
    }
  }
}

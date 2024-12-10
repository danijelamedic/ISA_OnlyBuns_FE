import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PostService } from '../post.service';

@Component({
  selector: 'create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {
  postForm: FormGroup;
  selectedImage: File | null = null;

  constructor(private fb: FormBuilder, private postService: PostService) {
    this.postForm = this.fb.group({
      description: [''],
      location: [''],
      creationTime: [new Date().toISOString()]
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
        location: this.postForm.get('location')?.value,
        creationTime: this.postForm.get('creationTime')?.value
      };
      
      this.postService.createPost(postData).subscribe({
        next: (response) => console.log("Post created successfully!", response),
        error: (error) => console.error("Error creating post:", error)
      });
    }
  }
  
}
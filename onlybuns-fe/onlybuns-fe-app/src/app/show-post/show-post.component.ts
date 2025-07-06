import { Component } from '@angular/core';
import { Post } from '../model/post.model';
import { Comment } from '../model/comment.model';
import { PostService } from '../post.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UpdatePostDto } from '../model/update-post.dto.model';
import { User } from '../model/user.model';
import { UserService } from '../admin/user.service';
import { Follower } from '../model/follower.mode';

@Component({
  selector: 'app-show-post',
  templateUrl: './show-post.component.html',
  styleUrls: ['./show-post.component.css']
})
export class ShowPostComponent {
  posts: Post[] = [];
  usernames: { [key: number]: string } = {};
  likesNum: { [key: number]: number } = {};
  defaultUserId: number = 1;
  commentsForPost: { [key: number]: Comment[] } = {};
  //isCommentsVisible: boolean = false;
  commentFormVisibleForPostId: number | null = null;
  userId: number = 1;
  isCommentFormVisible: boolean = false;
  newCommentText: string = '';
  postsByUser: Post[] = [];
  selectedTab: number = 1;
  isUpdateModalOpen = false;
  updateForm: FormGroup;
  selectedPostId: number | null = null;
  selectedPostDescription: string = '';
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  updatePostDto: UpdatePostDto = {
    id: 0,
    userId: 1,
    description: '',
    imagePath: ''
  };
  followingPosts: Post[] = [];
  followingUsers: User[] = [];
  explorePosts: Post[] = [];
  isFollowed: boolean = false;
  
  constructor(private postService: PostService, private fb: FormBuilder, private userService: UserService){
    this.updateForm = this.fb.group({
      description: [''],
      image: [null]
    });
  }

  ngOnInit(): void{
    this.getPosts();
    this.getPostsByUserId(1);
    this.getFollowingPosts();
  }

  getPosts(): void{
    this.postService.showPost().subscribe({
      next: (posts: Post[]) => {
        this.posts = posts;
        console.log('Loaded posts:', posts);
        
        this.posts = posts;

        posts.forEach(post => {
          this.getUsernameByPost(post.id);
          this.getLikesNum(post.id);
          post.isCommentsVisible = false; 
        });

        this.getPeopleIFollow();
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
      },
      complete: () => {
        console.log('Post loading complete');
      }
    });
  }

  getUsernameByPost(postId: number): void{
    this.postService.getUsernameByPost(postId).subscribe({
      next: (response: any) => {
        this.usernames[postId] = response.username; 
      },
      error: (error) => {
        console.error('Error fetching username for post ' + postId, error);
      }
    });
  }

  getLikesNum(postId: number): void{
    this.postService.getLikesNum(postId).subscribe({
      next: (likesNum: number) => {
        this.likesNum[postId] = likesNum;
      },
      error: (error) => {
        console.error('Error fetching likes for post ' + postId, error);
      }
    })
  }

  loadComments(postId: number): void {
  this.postService.getComments(postId).subscribe({
    next: (comments: Comment[]) => {
      // Sortiraj komentare od najnovijih ka najstarijima
      this.commentsForPost[postId] = comments.sort((a, b) => 
        new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
      );

      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.isCommentsVisible = true;
      }
    },
    error: (error: any) => {
      console.error('Error loading comments:', error);
    }
  });
}


  closeComments(postId: number): void {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isCommentsVisible = false;
    }
  }

  getUsername(userId: number): void{
    if (!this.usernames[userId]) {
      this.postService.getUsername(userId).subscribe({
        next: (result: any) => {
          this.usernames[userId] = result.username;
        },
        error: (error: any) => {
          console.error('Error loading username:', error);
        }
      });
    }
  }

  toggleCommentForm(postId: number): void {
  if (this.commentFormVisibleForPostId === postId) {
    this.commentFormVisibleForPostId = null; // zatvori ako je već otvoreno
  } else {
    this.commentFormVisibleForPostId = postId; // otvori samo za taj post
  }
}


  addComment(postId: number): void {
  if (!this.newCommentText.trim()) {
    console.warn('Komentar ne može biti prazan');
    return;
  }

  const commentPayload = {
    postId: postId,
    userId: this.userId,
    content: this.newCommentText
  };

  this.postService.addComment(commentPayload).subscribe({
    next: (response) => {
      console.log('Komentar dodat:', response);
      this.newCommentText = '';
      this.loadComments(postId); // osveži komentare za taj post
      this.commentFormVisibleForPostId = null; // zatvori formu za unos komentara
    },
    error: (error) => {
      console.error('Greška pri dodavanju komentara:', error);
      alert('Došlo je do greške pri dodavanju komentara.');
    }
  });
}


  getPostsByUserId(userId: number): void{
    this.postService.getPostsByUser(userId).subscribe({
      next: (posts: Post[]) => {
        this.postsByUser = posts;
        console.log('Postovi za korisnika:', posts);
      },
      error: (error) => {
        console.error('Greška prilikom učitavanja postova:', error);
      }
    });
  }

  selectTab(tabNumber: number): void {
    this.selectedTab = tabNumber;
    if (tabNumber === 2) {
      this.getPostsByUserId(1);
    }
    else if(tabNumber === 3){
      this.getFollowingPosts();
    }
  }

  deletePost(postId: number): void{
    this.postService.deletePost(postId).subscribe({
      next: () => {
        console.log('Obrisan je post' + postId);
        this.posts = this.posts.filter(post => post.id !== postId);
        this.ngOnInit();
      },
      error: (error) => {
        console.error("Greska prilikom brisanja posta: " + postId, error)
      }
    })
  }

  openUpdateModal(post: Post): void {
    this.selectedPostId = post.id;
    this.selectedPostDescription = post.description;
    this.imagePreview = post.imagePath ? `http://localhost:8080/${post.imagePath}` : null;

    this.updateForm.setValue({
      description: post.description,
      image: post.imagePath
    });

    this.isUpdateModalOpen = true;
  }

  closeUpdateModal(): void {
    this.isUpdateModalOpen = false;
    this.updateForm.reset();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onUpdatePost(): void {
    if (this.updateForm.valid && this.selectedPostId !== null) {
      const updateDto: UpdatePostDto = {
        id: this.selectedPostId,
        userId: 1,
        description: this.updateForm.value.description,
        imagePath: this.selectedImage ? '/images/' + (this.selectedImage?.name ?? '') : ''
      };

      this.postService.updatePost(updateDto).subscribe({
        next: (updatedPost) => {
          const postIndex = this.posts.findIndex(post => post.id === this.selectedPostId);
          if (postIndex !== -1) {
            this.posts[postIndex].description = updatedPost.description;
            this.posts[postIndex].imagePath = updatedPost.imagePath;
          }
          this.closeUpdateModal();
          this.ngOnInit();
        },
        error: (error) => {
          console.error('Error updating post:', error);
        }
      });
    }
  }

  likePost(postId: number): void {
    console.log("Usao je u metodu likePost sa postId: ", postId);
    this.postService.likePost(postId, this.userId).subscribe({
      next: () => {
        console.log('Lajkovan je post', postId);
        this.ngOnInit();
      },
      error: (error) => {
        console.error("Greška prilikom lajkovanja posta: ", postId, error);
      }
    });
  }
  
  getFollowingPosts(): void{
    this.postService.getFollowingPosts(this.userId).subscribe({
      next: (posts: Post[]) => {
        this.followingPosts = posts;
        console.log('Loaded posts:', posts);
        
        this.followingPosts = posts;

        posts.forEach(post => {
          this.getUsernameByPost(post.id);
          this.getLikesNum(post.id);
          post.isCommentsVisible = false; 
        });
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
      },
      complete: () => {
        console.log('Post loading complete');
      }
    });
  }

  getExplorePosts() : void{
    if(this.posts.length > 0){
      this.explorePosts = this.posts.filter(post => 
        !this.followingPosts.some(followingPost => followingPost.id === post.id)
      );
      console.log('explore posts:', this.explorePosts);
    }
    console.log("nije prosao if");
  }

  getPeopleIFollow(): void{
    this.userService.getFollowingUsers(this.userId).subscribe({
      next: (result: User[]) => {
        this.followingUsers = result;
        console.log('following users: ', this.followingUsers);
        this.getExplorePosts();
      },
      error: (error: any) => {
        console.error('Error loading posts:', error); 
      }
    });
  }

  isUserFollowed(postUser: User): boolean {
    return this.followingUsers?.some(user => 
      user.id === postUser.id
    );
  }
  

  followUser(followedUserId: number): void {
    this.userService.follow(this.userId, followedUserId).subscribe({
      next: (result: any) => {
        if (result) {
          this.isFollowed = true;
          console.log("Successfully followed the user.");
          window.location.reload();
        }
      },
      error: (error: any) => {
        if (error.status === 429) {
          alert("Too many requests. Please try again later.");
        } else {
          console.error("Error following user:", error);
        }
      }
    });
  }
  

  unfollowUser(followedUserId: number) : void{
    this.userService.unfollow(this.userId, followedUserId).subscribe({
      next: (result: any) => {
        if(result){
          this.isFollowed = false;
          ("otpratio sam ga");
          window.location.reload();
        }
      },
      error: (error: any) => {
        console.error('Error following user:', error); 
      }
    });
  }
}

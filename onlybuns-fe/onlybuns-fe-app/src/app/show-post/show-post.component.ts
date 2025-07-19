import { Component } from '@angular/core';
import { Post } from '../model/post.model';
import { Comment } from '../model/comment.model';
import { PostService } from '../services/post.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UpdatePostDto } from '../model/update-post.dto.model';
import { User } from '../model/user.model';
import { UserService } from '../services/user.service';
import { Follower } from '../model/follower.mode';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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
  userId: number = Number(localStorage.getItem("userId"));
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
    userId: 0,
    description: '',
    imagePath: ''
  };
  followingPosts: Post[] = [];
  followingUsers: User[] = [];
  explorePosts: Post[] = [];
  isFollowed: boolean = false;

  
  constructor(private postService: PostService, private fb: FormBuilder, private userService: UserService,  private route: ActivatedRoute){
    this.updateForm = this.fb.group({
      description: [''],
      image: [null]
    });
  }

  ngOnInit(): void {

  this.route.queryParams.subscribe((params: { selectedTab?: string }) => {
    const tab = params.selectedTab ? +params.selectedTab : 1;
    this.selectedTab = tab;
  });

  this.getPosts();
  this.getPostsByUserId(this.userId);
  this.getFollowingPosts();
}



  getPosts(): void{
    this.postService.showPost().subscribe({
      next: (posts: Post[]) => {
        this.posts = posts;
        console.log('Loaded posts:', posts);

        posts.forEach(post => {
          this.getUsernameByPost(post.id);
          this.countLikes(post.id);
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

  // getLikesNum(postId: number): void{
  //   this.postService.getLikesNum(postId).subscribe({
  //     next: (likesNum: number) => {
  //       this.likesNum[postId] = likesNum;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching likes for post ' + postId, error);
  //     }
  //   })
  // }

  loadComments(postId: number): void {
  this.postService.getComments(postId).subscribe({
    next: (comments: Comment[]) => {
      console.log(`Komentari za post ${postId}:`, comments);

      this.commentsForPost[postId] = comments.sort((a, b) => 
        new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
      );

      let post = this.posts.find(p => p.id === postId);
      if (!post) {
        const followingIndex = this.followingPosts.findIndex(p => p.id === postId);
        if (followingIndex !== -1) {
          this.followingPosts[followingIndex].isCommentsVisible = true;
          post = this.followingPosts[followingIndex];
        }
      } else {
        post.isCommentsVisible = true;
      }

      if (!post) {
        const exploreIndex = this.explorePosts.findIndex(p => p.id === postId);
        if (exploreIndex !== -1) {
          this.explorePosts[exploreIndex].isCommentsVisible = true;
          post = this.explorePosts[exploreIndex];
        }
      }

      if (post) {
        this.posts = [...this.posts];
        this.followingPosts = [...this.followingPosts];
        this.explorePosts = [...this.explorePosts];

        console.log('Updated post after loading comments:', post);
      }
    },
    error: (error: any) => {
      console.error('Error loading comments:', error);
    }
  });
}


loadFollowingComments(postId: number): void {
  this.postService.getComments(postId).subscribe({
    next: (comments: Comment[]) => {

      this.commentsForPost[postId] = comments.sort((a, b) => 
        new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
      );

      const index = this.followingPosts.findIndex(p => p.id === postId);
      if (index !== -1) {
        this.followingPosts[index].isCommentsVisible = true;
        console.log('Updated followingPosts post:', this.followingPosts[index]);
      }
    },
    error: (error: any) => {
      console.error('Error loading comments:', error);
    }
  });
} 

  closeComments(postId: number): void {
  let found = false;

  const postsIndex = this.posts.findIndex(p => p.id === postId);
  if (postsIndex !== -1) {
    this.posts[postsIndex].isCommentsVisible = false;
    found = true;
  }

  const followingIndex = this.followingPosts.findIndex(p => p.id === postId);
  if (followingIndex !== -1) {
    this.followingPosts[followingIndex].isCommentsVisible = false;
    found = true;
  }

  const exploreIndex = this.explorePosts.findIndex(p => p.id === postId);
  if (exploreIndex !== -1) {
    this.explorePosts[exploreIndex].isCommentsVisible = false;
    found = true;
  }

  if (found) {
    this.posts = [...this.posts];
    this.followingPosts = [...this.followingPosts];
    this.explorePosts = [...this.explorePosts];
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
      this.commentFormVisibleForPostId = null; 
    } else {
      this.commentFormVisibleForPostId = postId;
    }
  }


  addComment(postId: number): void {
    if (!this.newCommentText.trim()) {
      console.warn('Komentar ne može biti prazan');
      return;
    }

  console.log('User ID pri dodavanju komentara:', this.userId);
  
    const commentPayload = {
      postId: postId,
      userId: this.userId,
      content: this.newCommentText
    };

    this.postService.addComment(commentPayload).subscribe({
      next: (response) => {
        console.log('Komentar dodat:', response);
        this.newCommentText = '';
        this.loadComments(postId);
        this.commentFormVisibleForPostId = null; 
      },
      error: (error) => {
        console.error('Greska pri dodavanju komentara:', error);
        alert('Doslo je do greske pri dodavanju komentara.');
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
        console.error('Greska prilikom ucitavanja postova:', error);
      }
    });
  }

  selectTab(tabNumber: number): void {
    this.selectedTab = tabNumber;
    if (tabNumber === 2) {
      this.getExplorePosts();
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
        userId: this.userId,
        description: this.updateForm.value.description,
        imagePath: ''
      };

      const formData = new FormData();
      formData.append('updatePostDto', new Blob([JSON.stringify(updateDto)], { type: 'application/json' }));

      if (this.selectedImage) {
        formData.append('imageFile', this.selectedImage);
      }

      this.postService.updatePost(formData).subscribe({
        next: (updatedPost) => {
          const postIndex = this.posts.findIndex(post => post.id === this.selectedPostId);
          if (postIndex !== -1) {
            this.posts[postIndex].description = updatedPost.description;
            this.posts[postIndex].imagePath = updatedPost.imagePath;
          }
          this.closeUpdateModal();
          window.location.reload();
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
          this.countLikes(post.id);
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

  countLikes(id: number): void {
    this.postService.countLikes(id).subscribe({
      next: (response) => {
        this.likesNum[id] = response;
      },
      error: (err) => {
        console.log('Error fetching likes for post ' + id, err);
      }
    })
  }

    // getLikesNum(postId: number): void{
  //   this.postService.getLikesNum(postId).subscribe({
  //     next: (likesNum: number) => {
  //       this.likesNum[postId] = likesNum;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching likes for post ' + postId, error);
  //     }
  //   })
  // }
}

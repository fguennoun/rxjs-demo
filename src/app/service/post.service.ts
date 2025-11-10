import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {
  map,
  catchError,
  tap,
  shareReplay,
  retry
} from 'rxjs/operators';
import { Post, PostViewModel } from '../model/post.model';


// ============================================
// 📁 post.service.ts - The service (ALL BUSINESS LOGIC HERE!)
// ============================================

@Injectable({
  providedIn: 'root',
})
export class PostService {

  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  // Cache of posts to avoid multiple calls
  private postsCache$?: Observable<PostViewModel[]>;

  constructor(private http: HttpClient) {}

  // ✅ ALL BUSINESS LOGIC IS IN THE PIPE!
  getAllPosts(): Observable<PostViewModel[]> {
    // If already cached, return the cache
    if (this.postsCache$) {
      return this.postsCache$;
    }

    // Otherwise, load and cache
    this.postsCache$ = this.http.get<Post[]>(this.apiUrl).pipe(
      // Retry 2 times on failure
      retry(2),

      // Transform raw data into ViewModel
      map(posts => posts.map(post => this.transformPost(post))),

      // Side effect: log without modifying data
      tap(posts => console.log(`📊 ${posts.length} posts loaded`)),

      // Cache the result (avoids making the call again)
      shareReplay(1),

      // Error handling after cache so all subscribers receive the error
      catchError(this.handleError)
    );

    return this.postsCache$;
  }

  getPostsByUser(userId: number): Observable<PostViewModel[]> {
    return this.http.get<Post[]>(`${this.apiUrl}?userId=${userId}`).pipe(
      retry(2),
      map(posts => posts.map(post => this.transformPost(post))),
      tap(posts => console.log(`👤 ${posts.length} posts for user ${userId}`)),
      catchError(this.handleError)
    );
  }

  searchPosts(searchTerm: string): Observable<PostViewModel[]> {
    return this.getAllPosts().pipe(
      // Filter on client side after retrieving from cache
      map(posts => posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase())
      )),
      tap(posts => console.log(`🔍 ${posts.length} posts found for "${searchTerm}"`))
    );
  }

  // Private method to transform a Post into PostViewModel
  private transformPost(post: Post): PostViewModel {
    const words = post.body.split(' ').length;
    const excerpt = post.body.substring(0, 100) + '...';

    return {
      ...post,
      title: this.capitalizeTitle(post.title),
      wordCount: words,
      excerpt: excerpt
    };
  }

  private capitalizeTitle(title: string): string {
    return title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error code: ${error.status}, Message: ${error.message}`;
    }

    console.error('❌', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Clears the cache (useful for forcing a reload)
  clearCache(): void {
    this.postsCache$ = undefined;
  }

}

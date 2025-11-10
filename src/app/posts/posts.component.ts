import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, Observable, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
  map,
  takeUntil,
  catchError,
  tap,
  finalize,
  shareReplay,
} from 'rxjs/operators';
import { PostViewModel } from '../model/post.model';
import { PostService } from '../service/post.service';

// ============================================
// 📁 posts.component.ts - The component
// ============================================

@Component({
  selector: 'app-posts',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
})
export class PostsComponent implements OnInit, OnDestroy {
  // FormControl for search
  searchControl = new FormControl('');
  userIdControl = new FormControl<number | null>(null);

  // Observable of posts (DECLARATIVE, no manual subscription!)
  posts$!: Observable<PostViewModel[]>;

  // Stats calculated automatically
  stats$!: Observable<{
    total: number;
    displayed: number;
    totalWords: number;
  }>;

  // Combined observable with posts and loading state
  postsWithState$!: Observable<{ posts: PostViewModel[]; loading: boolean }>;
  error: string | null = null;

  // For proper unsubscription
  private destroy$ = new Subject<void>();
  // Refresh trigger to force reload
  private refreshTrigger$ = new Subject<void>();

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    // ✅ DECLARATIVE APPROACH with RxJS
    // Combine search and user filter
    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const userId$ = this.userIdControl.valueChanges.pipe(
      startWith(this.userIdControl.value),
      // Normalize value: handle edge cases from HTML select
      map((value: number | null | string | undefined) => {
        // Convert null, undefined, empty string, or string "null" to actual null
        if (value === null || value === undefined || value === '') {
          return null;
        }
        // Handle string representation of null
        if (typeof value === 'string' && (value === 'null' || value.trim() === '')) {
          return null;
        }
        // Convert string numbers to actual numbers, keep numbers as-is
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? null : parsed;
        }
        // Return number value or null
        return typeof value === 'number' ? value : null;
      }),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    // Refresh trigger starts with a value and listens for refresh events
    const refresh$ = this.refreshTrigger$.pipe(
      startWith(undefined),
      takeUntil(this.destroy$)
    );

    // Create a loading state subject that tracks when data is being fetched
    const isLoading$ = new Subject<boolean>();
    
    // Combine the three Observables to get posts
    const posts$ = combineLatest([searchTerm$, userId$, refresh$]).pipe(
      tap(() => {
        isLoading$.next(true);
        this.error = null;
      }),
      switchMap(([searchTerm, userId, _]) => {
        // Ignore refresh trigger value (third parameter), it's only used to force reload
        // If a userId is selected (not null), filter by user; otherwise get all posts
        const source$ = userId !== null && userId !== undefined
          ? this.postService.getPostsByUser(userId)
          : this.postService.getAllPosts();

        // Then apply the search
        return source$.pipe(
          map((posts) =>
            searchTerm
              ? posts.filter(
                  (post) =>
                    post.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    post.body.toLowerCase().includes(searchTerm.toLowerCase())
                )
              : posts
          ),
          tap(() => {
            // Set loading to false when data arrives
            isLoading$.next(false);
          }),
          catchError((error) => {
            this.error = error.message || 'An error occurred while loading posts';
            isLoading$.next(false); // Set loading to false on error
            return of([]);
          })
        );
      }),
      shareReplay(1), // Share the result to avoid multiple subscriptions
      takeUntil(this.destroy$)
    );

    // Expose posts observable
    this.posts$ = posts$;

    // Create loading state observable - starts with true for initial load
    const loading$ = isLoading$.pipe(
      startWith(true), // Start with true for initial load
      takeUntil(this.destroy$)
    );

    // Combine posts and loading state into a single observable for template efficiency
    // Use combineLatest with startWith to ensure both emit
    this.postsWithState$ = combineLatest([
      posts$.pipe(startWith([] as PostViewModel[])), // Start with empty array
      loading$
    ]).pipe(
      map(([posts, loading]: [PostViewModel[], boolean]) => ({ 
        posts, 
        loading: loading && posts.length === 0 // Only show loading if no posts yet
      })),
      takeUntil(this.destroy$)
    );

    // Calculate stats automatically from posts$
    this.stats$ = this.posts$.pipe(
      map((posts) => ({
        total: posts.length,
        displayed: posts.length,
        totalWords: posts.reduce((sum, post) => sum + post.wordCount, 0),
      })),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshTrigger$.complete();
  }

  refresh(): void {
    this.postService.clearCache();
    // Trigger a new load by emitting to refresh trigger
    this.refreshTrigger$.next();
  }

  filterByUser(userId: number): void {
    this.userIdControl.setValue(userId);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.userIdControl.setValue(null);
  }
}

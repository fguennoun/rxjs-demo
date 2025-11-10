import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, Observable, combineLatest, of, fromEvent, interval, merge, EMPTY } from 'rxjs';
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
  filter,
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

  // Notification system
  notification$ = new Subject<string | null>();
  currentNotification: string | null = null;

  // Auto-refresh toggle
  autoRefreshEnabled = false;
  autoRefreshInterval = 30; // seconds

  // Sort options
  sortBy: 'id' | 'title' | 'userId' = 'id';
  sortOrder: 'asc' | 'desc' = 'asc';

  // For proper unsubscription
  private destroy$ = new Subject<void>();
  // Refresh trigger to force reload
  private refreshTrigger$ = new Subject<void>();
  // Auto-refresh trigger (emits boolean to enable/disable)
  private autoRefreshTrigger$ = new Subject<boolean>();

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    // ✅ KEYBOARD SHORTCUTS with fromEvent (RxJS)
    this.setupKeyboardShortcuts();

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
    const manualRefresh$ = this.refreshTrigger$.pipe(
      startWith(undefined),
      takeUntil(this.destroy$)
    );

    // ✅ AUTO-REFRESH with interval (RxJS)
    // Create auto-refresh observable that emits every X seconds when enabled
    const autoRefresh$ = this.autoRefreshTrigger$.pipe(
      startWith(false),
      switchMap(enabled => {
        if (!enabled) {
          // Return EMPTY observable that never emits when disabled
          return EMPTY;
        }
        // When enabled, create interval that emits every X seconds
        return interval(this.autoRefreshInterval * 1000).pipe(
          tap(() => {
            this.showNotification(`Auto-refreshing...`);
          }),
          map(() => undefined), // Emit undefined to trigger refresh
          takeUntil(this.destroy$)
        );
      }),
      takeUntil(this.destroy$)
    );

    // Merge manual and auto refresh triggers
    const refresh$ = merge(manualRefresh$, autoRefresh$).pipe(
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

        // Then apply the search and sorting
        return source$.pipe(
          map((posts) => {
            // Apply search filter
            let filtered = searchTerm
              ? posts.filter(
                  (post) =>
                    post.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    post.body.toLowerCase().includes(searchTerm.toLowerCase())
                )
              : posts;
            
            // ✅ SORTING with scan-like approach (RxJS)
            return this.sortPosts(filtered, this.sortBy, this.sortOrder);
          }),
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

    // ✅ NOTIFICATION SYSTEM with Subject (RxJS)
    this.notification$.pipe(
      tap(notification => {
        this.currentNotification = notification;
        if (notification) {
          // Auto-hide notification after 3 seconds
          setTimeout(() => {
            this.currentNotification = null;
          }, 3000);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  // ✅ KEYBOARD SHORTCUTS with fromEvent (RxJS)
  private setupKeyboardShortcuts(): void {
    fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter(event => {
        // Only trigger when not typing in input fields
        const target = event.target as HTMLElement;
        return target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA';
      }),
      map(event => event.key.toLowerCase()),
      filter(key => key === 'r' || key === 'c' || key === 'f'),
      takeUntil(this.destroy$)
    ).subscribe(key => {
      if (key === 'r') {
        this.refresh();
        this.showNotification('Refreshed! (Press R to refresh)');
      } else if (key === 'c') {
        this.clearFilters();
        this.showNotification('Filters cleared! (Press C to clear)');
      } else if (key === 'f') {
        // Focus search input
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  // ✅ SORTING functionality
  private sortPosts(posts: PostViewModel[], sortBy: 'id' | 'title' | 'userId', order: 'asc' | 'desc'): PostViewModel[] {
    const sorted = [...posts].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'userId':
          comparison = a.userId - b.userId;
          break;
      }
      return order === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }

  // Show notification
  showNotification(message: string): void {
    this.notification$.next(message);
  }

  // Toggle auto-refresh
  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    // Trigger the auto-refresh observable to start/stop
    this.autoRefreshTrigger$.next(this.autoRefreshEnabled);
    if (this.autoRefreshEnabled) {
      this.showNotification(`Auto-refresh enabled (every ${this.autoRefreshInterval}s)`);
    } else {
      this.showNotification('Auto-refresh disabled');
    }
  }

  // Change sort option
  changeSort(sortBy: 'id' | 'title' | 'userId'): void {
    if (this.sortBy === sortBy) {
      // Toggle order if same sort option
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    // Trigger refresh to apply sorting
    this.refreshTrigger$.next();
    this.showNotification(`Sorted by ${sortBy} (${this.sortOrder})`);
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshTrigger$.complete();
    this.autoRefreshTrigger$.complete();
    this.notification$.complete();
  }

  refresh(): void {
    this.postService.clearCache();
    // Trigger a new load by emitting to refresh trigger
    this.refreshTrigger$.next();
    this.showNotification('Data refreshed!');
  }

  filterByUser(userId: number): void {
    this.userIdControl.setValue(userId);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.userIdControl.setValue(null);
    this.showNotification('Filters cleared!');
  }
}

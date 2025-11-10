# RxJS Demo - Angular Application

A modern Angular application demonstrating reactive programming with RxJS, showcasing how to fetch and manage data from REST APIs using Angular's HttpClient and RxJS operators.

## 📋 Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [RxJS Overview](#rxjs-overview)
- [Angular HttpClient](#angular-httpclient)
- [JSONPlaceholder API](#jsonplaceholder-api)
- [RxJS Operators Used](#rxjs-operators-used)
- [Implementation Details](#implementation-details)
- [Best Practices](#best-practices)
- [Development](#development)

## 🎯 Overview

This application demonstrates how to build a reactive Angular application using RxJS for managing asynchronous data streams. It fetches posts from the JSONPlaceholder API and provides search and filtering capabilities, all implemented using declarative RxJS patterns.

### Key Features

- ✅ Fetch posts from REST API using Angular HttpClient
- ✅ Reactive search with debouncing
- ✅ User-based filtering
- ✅ **Sorting functionality** (by ID, Title, User ID)
- ✅ **Keyboard shortcuts** (R=refresh, C=clear, F=focus search)
- ✅ **Auto-refresh toggle** with interval
- ✅ **Notification system** with toast messages
- ✅ Loading states and error handling
- ✅ Data caching with shareReplay
- ✅ Automatic subscription management with async pipe
- ✅ Memory leak prevention with takeUntil
- ✅ Modern, responsive UI
- ✅ Modern Angular control flow (@if, @for)

## 🛠 Technologies Used

- **Angular 20.0** - Modern web framework
- **RxJS 7.8** - Reactive programming library
- **TypeScript 5.8** - Type-safe JavaScript
- **JSONPlaceholder API** - Fake REST API for testing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI 20.0+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rxjs-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200/`

## 📁 Project Structure

```
src/
├── app/
│   ├── model/
│   │   └── post.model.ts          # TypeScript interfaces
│   ├── service/
│   │   └── post.service.ts        # HTTP service with RxJS
│   ├── posts/
│   │   ├── posts.component.ts     # Component with reactive patterns
│   │   ├── posts.component.html   # Template with async pipe
│   │   └── posts.component.css    # Component styles
│   ├── app.config.ts              # Application configuration
│   └── app.ts                     # Root component
└── styles.css                     # Global styles
```

## 🔄 RxJS Overview

**RxJS (Reactive Extensions for JavaScript)** is a library for reactive programming using Observables. It makes it easier to compose asynchronous or callback-based code.

### Key Concepts

#### Observables
An Observable is a stream of data that can be observed over time. It can emit:
- **Values** (next)
- **Errors** (error)
- **Completion** (complete)

```typescript
// Observable that emits values over time
const observable = new Observable(observer => {
  observer.next('Hello');
  observer.next('World');
  observer.complete();
});
```

#### Observers
An Observer is a consumer of values delivered by an Observable. It has three methods:
- `next(value)` - Receives the next value
- `error(err)` - Receives an error
- `complete()` - Receives completion notification

#### Subscriptions
A Subscription represents the execution of an Observable. It can be used to cancel the execution.

```typescript
const subscription = observable.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('Done')
});

// Unsubscribe to prevent memory leaks
subscription.unsubscribe();
```

#### Subjects
A Subject is a special type of Observable that allows values to be multicasted to many Observers. Subjects are like EventEmitters: they maintain a registry of many listeners.

```typescript
const subject = new Subject<string>();

// Subscribe to the subject
subject.subscribe(value => console.log(value));

// Emit values
subject.next('Hello');
subject.next('World');

// Complete the subject
subject.complete();
```

**Types of Subjects:**
- **Subject**: Basic Subject, no initial value
- **BehaviorSubject**: Requires an initial value and stores the current value
- **ReplaySubject**: Replays a specified number of emissions to new subscribers
- **AsyncSubject**: Emits only the last value when it completes

### Why RxJS?

- **Declarative**: Describe what you want, not how to get it
- **Composable**: Combine multiple streams easily
- **Powerful operators**: Transform, filter, and combine data
- **Error handling**: Built-in error management
- **Memory management**: Easy cleanup of subscriptions

## 🌐 Angular HttpClient

Angular's `HttpClient` is a service for making HTTP requests. It returns Observables, making it perfect for use with RxJS.

### Configuration

In standalone Angular applications, you need to provide HttpClient:

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()  // Enable HTTP requests
  ]
};
```

### Basic Usage

```typescript
// post.service.ts
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts');
  }
}
```

### HttpClient Methods

- `get<T>(url)` - GET request
- `post<T>(url, body)` - POST request
- `put<T>(url, body)` - PUT request
- `delete<T>(url)` - DELETE request
- `patch<T>(url, body)` - PATCH request

All methods return `Observable<T>`, which can be transformed using RxJS operators.

## 📡 JSONPlaceholder API

**JSONPlaceholder** is a free fake REST API for testing and prototyping. It provides endpoints for:
- Posts
- Comments
- Albums
- Photos
- Todos
- Users

### API Endpoints Used

- `GET /posts` - Get all posts
- `GET /posts?userId={id}` - Get posts by user ID

### Example Response

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita..."
}
```

### Why JSONPlaceholder?

- ✅ Free and no authentication required
- ✅ Realistic data structure
- ✅ Fast and reliable
- ✅ Perfect for learning and prototyping

## 🎛 RxJS Operators Used

This project demonstrates various RxJS operators for managing data streams:

### Creation Operators

#### `of(value)`
Creates an Observable that emits the given value and completes.

```typescript
of([])  // Emits empty array and completes
```

#### `fromEvent(target, eventName)`
Creates an Observable from DOM events or other event sources.

```typescript
fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  map(event => event.key),
  filter(key => key === 'r')
).subscribe(key => {
  console.log('R key pressed!');
});
```

#### `interval(period)`
Creates an Observable that emits sequential numbers every specified time interval.

```typescript
interval(1000).pipe(
  take(5)  // Emit 5 times then complete
).subscribe(count => {
  console.log(count);  // 0, 1, 2, 3, 4
});
```

#### `EMPTY`
An Observable that immediately completes without emitting any values.

```typescript
EMPTY.subscribe({
  next: () => console.log('Never called'),
  complete: () => console.log('Immediately completes')
});
```

### Transformation Operators

#### `map(project)`
Transforms each emitted value by applying a function.

```typescript
this.http.get<Post[]>('/posts').pipe(
  map(posts => posts.map(post => this.transformPost(post)))
)
```

#### `switchMap(project)`
Maps each value to an Observable, then flattens it. Cancels previous inner Observables when a new value arrives.

```typescript
searchTerm$.pipe(
  switchMap(term => this.searchPosts(term))
)
```

### Filtering Operators

#### `filter(predicate)`
Emits only values that pass the predicate function.

```typescript
posts.pipe(
  filter(post => post.userId === 1)
)
```

#### `distinctUntilChanged()`
Emits only when the current value is different from the previous value.

```typescript
searchControl.valueChanges.pipe(
  distinctUntilChanged()
)
```

#### `debounceTime(dueTime)`
Emits a value only after a specified time has passed without another source emission.

```typescript
searchControl.valueChanges.pipe(
  debounceTime(300)  // Wait 300ms after user stops typing
)
```

### Combination Operators

#### `combineLatest([...observables])`
Combines multiple Observables to create an Observable that emits arrays of the latest values from each.

```typescript
combineLatest([searchTerm$, userId$]).pipe(
  switchMap(([searchTerm, userId]) => {
    // Use both values
  })
)
```

#### `merge(...observables)`
Creates an Observable that emits all values from all input Observables.

```typescript
const manualRefresh$ = this.refreshTrigger$;
const autoRefresh$ = interval(30000);

merge(manualRefresh$, autoRefresh$).subscribe(() => {
  // Triggered by either manual or auto refresh
});
```

#### `startWith(value)`
Returns an Observable that emits the given value first, then emits values from the source.

```typescript
searchControl.valueChanges.pipe(
  startWith('')  // Emit empty string immediately
)
```

### Utility Operators

#### `tap(next)`
Performs a side effect for every emission. Useful for logging or triggering actions.

```typescript
.pipe(
  tap(posts => console.log(`Loaded ${posts.length} posts`))
)
```

#### `catchError(handler)`
Catches errors and handles them by returning a new Observable.

```typescript
.pipe(
  catchError(error => {
    console.error(error);
    return of([]);  // Return empty array on error
  })
)
```

#### `retry(count)`
Retries the source Observable a specified number of times on error.

```typescript
this.http.get('/posts').pipe(
  retry(2)  // Retry up to 2 times on failure
)
```

#### `finalize(callback)`
Calls a function when the source Observable completes or errors.

```typescript
.pipe(
  finalize(() => this.loading = false)
)
```

#### `takeUntil(notifier)`
Emits values until the notifier Observable emits.

```typescript
observable$.pipe(
  takeUntil(this.destroy$)  // Unsubscribe when destroy$ emits
)
```

#### `shareReplay(bufferSize)`
Shares the source Observable and replays the last N emissions to new subscribers.

```typescript
this.postsCache$ = this.http.get('/posts').pipe(
  shareReplay(1)  // Cache and share the last emission
)
```

## 🎮 Advanced Features

### Keyboard Shortcuts with `fromEvent`

The application implements keyboard shortcuts using `fromEvent` to listen to keyboard events:

```typescript
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
    } else if (key === 'c') {
      this.clearFilters();
    } else if (key === 'f') {
      // Focus search input
    }
  });
}
```

**Available Shortcuts:**
- **R** - Refresh data
- **C** - Clear all filters
- **F** - Focus search input

### Auto-Refresh with `interval` and `merge`

The application implements auto-refresh functionality using `interval` and `merge`:

```typescript
// Manual refresh trigger
const manualRefresh$ = this.refreshTrigger$.pipe(
  startWith(undefined)
);

// Auto-refresh trigger (every 30 seconds when enabled)
const autoRefresh$ = this.autoRefreshTrigger$.pipe(
  startWith(false),
  switchMap(enabled => {
    if (!enabled) {
      return EMPTY;  // Don't emit when disabled
    }
    return interval(30000).pipe(
      map(() => undefined)  // Emit to trigger refresh
    );
  })
);

// Merge both triggers
const refresh$ = merge(manualRefresh$, autoRefresh$);
```

**Features:**
- Toggle auto-refresh on/off
- Configurable refresh interval (30 seconds)
- Visual indicator when auto-refresh is active
- Automatically merges with manual refresh triggers

### Notification System with `Subject`

The application uses a `Subject` to implement a notification/toast system:

```typescript
// Notification subject
notification$ = new Subject<string | null>();
currentNotification: string | null = null;

// Subscribe to notifications
this.notification$.pipe(
  tap(notification => {
    this.currentNotification = notification;
    if (notification) {
      // Auto-hide after 3 seconds
      setTimeout(() => {
        this.currentNotification = null;
      }, 3000);
    }
  }),
  takeUntil(this.destroy$)
).subscribe();

// Show notification
showNotification(message: string): void {
  this.notification$.next(message);
}
```

**Features:**
- Toast notifications for user actions
- Auto-hide after 3 seconds
- Smooth slide-in animation
- Non-intrusive design

### Sorting Functionality

The application implements reactive sorting with multiple options:

```typescript
// Sort options
sortBy: 'id' | 'title' | 'userId' = 'id';
sortOrder: 'asc' | 'desc' = 'asc';

// Sort posts
private sortPosts(
  posts: PostViewModel[], 
  sortBy: 'id' | 'title' | 'userId', 
  order: 'asc' | 'desc'
): PostViewModel[] {
  return [...posts].sort((a, b) => {
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
}
```

**Features:**
- Sort by ID, Title, or User ID
- Toggle ascending/descending order
- Visual indicators for active sort and direction
- Reactive updates using Observables

## 💻 Implementation Details

### Service Layer (`post.service.ts`)

The service handles all HTTP requests and data transformation:

```typescript
@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  private postsCache$?: Observable<PostViewModel[]>;

  getAllPosts(): Observable<PostViewModel[]> {
    // Return cached Observable if available
    if (this.postsCache$) {
      return this.postsCache$;
    }

    // Create and cache Observable
    this.postsCache$ = this.http.get<Post[]>(this.apiUrl).pipe(
      retry(2),                                    // Retry on failure
      map(posts => posts.map(this.transformPost)), // Transform data
      tap(posts => console.log(`Loaded ${posts.length} posts`)),
      shareReplay(1),                             // Cache and share
      catchError(this.handleError)                // Handle errors
    );

    return this.postsCache$;
  }
}
```

**Key Features:**
- ✅ Caching with `shareReplay(1)`
- ✅ Error handling with `catchError`
- ✅ Retry logic with `retry(2)`
- ✅ Data transformation with `map`

### Component Layer (`posts.component.ts`)

The component uses reactive patterns to manage UI state with advanced features:

```typescript
export class PostsComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  userIdControl = new FormControl<number | null>(null);
  posts$!: Observable<PostViewModel[]>;
  
  // Notification system
  notification$ = new Subject<string | null>();
  currentNotification: string | null = null;
  
  // Auto-refresh
  autoRefreshEnabled = false;
  autoRefreshInterval = 30; // seconds
  
  // Sorting
  sortBy: 'id' | 'title' | 'userId' = 'id';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  private destroy$ = new Subject<void>();
  private refreshTrigger$ = new Subject<void>();
  private autoRefreshTrigger$ = new Subject<boolean>();

  ngOnInit(): void {
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Create observables from form controls
    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const userId$ = this.userIdControl.valueChanges.pipe(
      startWith(null),
      takeUntil(this.destroy$)
    );

    // Manual and auto refresh triggers
    const manualRefresh$ = this.refreshTrigger$.pipe(startWith(undefined));
    const autoRefresh$ = this.autoRefreshTrigger$.pipe(
      startWith(false),
      switchMap(enabled => enabled 
        ? interval(this.autoRefreshInterval * 1000)
        : EMPTY
      )
    );
    const refresh$ = merge(manualRefresh$, autoRefresh$);

    // Combine observables
    this.posts$ = combineLatest([searchTerm$, userId$, refresh$]).pipe(
      switchMap(([searchTerm, userId, _]) => {
        const source$ = userId
          ? this.postService.getPostsByUser(userId)
          : this.postService.getAllPosts();

        return source$.pipe(
          map(posts => {
            // Apply search filter
            let filtered = searchTerm
              ? posts.filter(post => /* search logic */)
              : posts;
            // Apply sorting
            return this.sortPosts(filtered, this.sortBy, this.sortOrder);
          }),
          catchError(error => {
            this.error = error.message;
            return of([]);
          })
        );
      }),
      shareReplay(1),
      takeUntil(this.destroy$)
    );
    
    // Setup notification system
    this.notification$.pipe(
      tap(notification => {
        this.currentNotification = notification;
        if (notification) {
          setTimeout(() => this.currentNotification = null, 3000);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshTrigger$.complete();
    this.autoRefreshTrigger$.complete();
    this.notification$.complete();
  }
}
```

**Key Features:**
- ✅ Declarative data flow
- ✅ Automatic subscription cleanup
- ✅ Loading and error state management
- ✅ Debounced search
- ✅ Combined filters
- ✅ Keyboard shortcuts with `fromEvent`
- ✅ Auto-refresh with `interval` and `merge`
- ✅ Notification system with `Subject`
- ✅ Sorting functionality
- ✅ Combined state management

### Template (`posts.component.html`)

The template uses modern Angular control flow syntax (`@if`, `@for`) and the async pipe:

```html
<!-- Notification Toast -->
@if (currentNotification) {
  <div class="notification">
    {{ currentNotification }}
  </div>
}

<!-- Controls with sorting and auto-refresh -->
<div class="controls">
  <input [formControl]="searchControl" placeholder="🔍 Search... (Press F to focus)" />
  
  <select [formControl]="userIdControl">
    <option [ngValue]="null">All Users</option>
    <!-- ... -->
  </select>
  
  <!-- Sort controls -->
  <div class="sort-controls">
    <button (click)="changeSort('id')" [class.active]="sortBy === 'id'">
      ID {{ sortBy === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
    </button>
    <!-- ... -->
  </div>
  
  <button (click)="refresh()" title="Press R to refresh">🔄 Refresh</button>
  <button (click)="toggleAutoRefresh()" [class.active]="autoRefreshEnabled">
    {{ autoRefreshEnabled ? '⏸️ Auto-refresh ON' : '▶️ Auto-refresh OFF' }}
  </button>
</div>

<!-- Posts with async pipe -->
@if (postsWithState$ | async; as state) {
  @if (state.posts.length > 0) {
    <div class="posts">
      @for (post of state.posts; track post.id) {
        <div class="post">
          <h3>{{ post.title }}</h3>
          <p>{{ post.excerpt }}</p>
        </div>
      }
    </div>
  }
}
```

**Benefits:**
- ✅ Modern Angular control flow (`@if`, `@for`)
- ✅ Automatic subscription management with async pipe
- ✅ Automatic unsubscription on component destroy
- ✅ No manual cleanup needed
- ✅ Cleaner, more readable template code
- ✅ Better performance with track function in `@for`
- ✅ Type-safe template code

## ✅ Best Practices

### 1. Use Async Pipe

**❌ Bad:**
```typescript
ngOnInit() {
  this.postService.getAllPosts().subscribe(posts => {
    this.posts = posts;
  });
}
```

**✅ Good:**
```typescript
posts$ = this.postService.getAllPosts();

// In template
<div *ngIf="posts$ | async as posts">...</div>
```

### 2. Prevent Memory Leaks

**❌ Bad:**
```typescript
ngOnInit() {
  this.postService.getAllPosts().subscribe();
  // Subscription never cleaned up!
}
```

**✅ Good:**
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.postService.getAllPosts().pipe(
    takeUntil(this.destroy$)
  ).subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3. Handle Errors

**❌ Bad:**
```typescript
this.http.get('/posts').subscribe(
  posts => this.posts = posts
  // No error handling!
);
```

**✅ Good:**
```typescript
this.http.get('/posts').pipe(
  catchError(error => {
    console.error(error);
    this.error = 'Failed to load posts';
    return of([]);
  })
).subscribe();
```

### 4. Cache HTTP Requests

**❌ Bad:**
```typescript
getAllPosts() {
  return this.http.get('/posts');  // New request every time
}
```

**✅ Good:**
```typescript
private postsCache$?: Observable<Post[]>;

getAllPosts() {
  if (!this.postsCache$) {
    this.postsCache$ = this.http.get('/posts').pipe(
      shareReplay(1)
    );
  }
  return this.postsCache$;
}
```

### 5. Debounce User Input

**❌ Bad:**
```typescript
searchControl.valueChanges.subscribe(term => {
  this.search(term);  // Called on every keystroke!
});
```

**✅ Good:**
```typescript
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(term => {
  this.search(term);  // Called only after user stops typing
});
```

### 6. Use TypeScript Interfaces

**❌ Bad:**
```typescript
getAllPosts(): Observable<any> {  // No type safety
  return this.http.get('/posts');
}
```

**✅ Good:**
```typescript
getAllPosts(): Observable<Post[]> {  // Type-safe
  return this.http.get<Post[]>('/posts');
}
```

## 🔧 Development

### Code Scaffolding

**Generate component (skip tests):**
```bash
ng generate component posts --skip-tests=true
```

**Generate service (skip tests):**
```bash
ng generate service post --skip-tests=true
```

### Build

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
ng test
```

### Additional Resources

- [Angular Documentation](https://angular.dev)
- [RxJS Documentation](https://rxjs.dev)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com)
- [Angular HttpClient Guide](https://angular.dev/guide/http)

## 📝 Summary

This application demonstrates:

1. **Reactive Programming**: Using RxJS Observables for data streams
2. **HTTP Requests**: Fetching data with Angular HttpClient
3. **Data Transformation**: Using RxJS operators to transform data
4. **Error Handling**: Proper error handling with RxJS
5. **Memory Management**: Preventing memory leaks with takeUntil
6. **Caching**: Implementing request caching with shareReplay
7. **Declarative UI**: Using async pipe for automatic subscription management
8. **Modern Angular**: Using standalone components and modern Angular features
9. **Event Handling**: Using `fromEvent` for keyboard shortcuts
10. **Timers**: Using `interval` for auto-refresh functionality
11. **Observable Combination**: Using `merge` to combine multiple triggers
12. **Reactive Communication**: Using `Subject` for notifications
13. **Sorting**: Implementing reactive sorting with state management
14. **Modern Control Flow**: Using `@if` and `@for` syntax

## 🎓 Learning Outcomes

After studying this project, you should understand:

- ✅ How to use RxJS with Angular
- ✅ How to fetch data from REST APIs
- ✅ How to handle asynchronous operations
- ✅ How to prevent memory leaks
- ✅ How to implement reactive search and filtering
- ✅ How to cache HTTP requests
- ✅ How to handle errors gracefully
- ✅ How to use the async pipe
- ✅ How to handle DOM events with `fromEvent`
- ✅ How to create timers with `interval`
- ✅ How to combine Observables with `merge` and `combineLatest`
- ✅ How to use `Subject` for reactive communication
- ✅ How to implement keyboard shortcuts
- ✅ How to create auto-refresh functionality
- ✅ How to build notification systems
- ✅ How to implement reactive sorting
- ✅ How to use modern Angular control flow (`@if`, `@for`)
- ✅ Best practices for RxJS in Angular

---

**Happy Coding! 🚀**

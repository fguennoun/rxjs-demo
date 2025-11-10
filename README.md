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
- ✅ Loading states and error handling
- ✅ Data caching with shareReplay
- ✅ Automatic subscription management with async pipe
- ✅ Memory leak prevention with takeUntil
- ✅ Modern, responsive UI

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

The component uses reactive patterns to manage UI state:

```typescript
export class PostsComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  userIdControl = new FormControl<number | null>(null);
  posts$!: Observable<PostViewModel[]>;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
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

    // Combine observables
    this.posts$ = combineLatest([searchTerm$, userId$]).pipe(
      switchMap(([searchTerm, userId]) => {
        const source$ = userId
          ? this.postService.getPostsByUser(userId)
          : this.postService.getAllPosts();

        return source$.pipe(
          map(posts => this.filterPosts(posts, searchTerm)),
          catchError(error => {
            this.error = error.message;
            return of([]);
          })
        );
      }),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Key Features:**
- ✅ Declarative data flow
- ✅ Automatic subscription cleanup
- ✅ Loading and error state management
- ✅ Debounced search
- ✅ Combined filters

### Template (`posts.component.html`)

The template uses the async pipe for automatic subscription management:

```html
<!-- Async pipe automatically subscribes and unsubscribes -->
<div *ngIf="posts$ | async as posts">
  <div *ngFor="let post of posts" class="post">
    <h3>{{ post.title }}</h3>
    <p>{{ post.excerpt }}</p>
  </div>
</div>
```

**Benefits of Async Pipe:**
- ✅ Automatic subscription management
- ✅ Automatic unsubscription on component destroy
- ✅ No manual cleanup needed
- ✅ Cleaner template code

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
- ✅ Best practices for RxJS in Angular

---

**Happy Coding! 🚀**

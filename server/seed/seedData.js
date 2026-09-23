const bcrypt = require('bcryptjs');
const Book = require('../models/Book');
const User = require('../models/User');
const Order = require('../models/Order');

const initialBooks = [
  {
    title: 'System Design Masterclass',
    author: 'Shefali Jangid',
    edition: 'Edition 2026',
    price: 499,
    formats: ['EPUB', 'PDF'],
    deliveryTag: 'Instant Delivery',
    status: 'Published',
    featured: true,
    tag: 'SYSTEMS',
    readingMood: 'High Scalability & Microservices Architecture',
    pageCount: 180,
    rating: 4.9,
    synopsis: 'A step-by-step practical guide covering scalable frontend system architecture, state management, and API design. Learn how enterprise engineering teams build resilient, low-latency web apps.',
    coverGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    coverColor: '#1e293b',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Introduction to Distributed Frontend Systems',
      subtitle: 'Fundamentals of Modular UI Architecture',
      content: `Modern software development demands robust architectural foundations. When designing frontend systems at scale, isolation, predictability, and composability are non-negotiable.\n\nIn this introductory chapter, we examine how state boundaries allow teams to build micro-frontends without tight coupling or cascading regressions. By strictly isolating domain logic from visual presentation, frontend components remain easily testable and decoupled from underlying API changes.`,
      keyTakeaway: 'Decouple view layers from global state to ensure modular testability and scalability.',
      pageOffset: 12
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'Introduction to Distributed Frontend Systems',
        subtitle: 'Fundamentals of Modular UI Architecture',
        content: `Modern software development demands robust architectural foundations. When designing frontend systems at scale, isolation, predictability, and composability are non-negotiable.\n\nIn this chapter, we examine how state boundaries allow teams to build micro-frontends without tight coupling or cascading regressions. By strictly isolating domain logic from visual presentation, frontend components remain easily testable and decoupled from underlying API changes.`,
        keyTakeaway: 'Decouple view layers from global state to ensure modular testability and scalability.',
        pageOffset: 12
      },
      {
        chapterNumber: 2,
        title: 'API Gateway & Event-Driven UI Patterns',
        subtitle: 'Handling Real-Time Telemetry and WebSocket Streams',
        content: `As backend microservices proliferate, consumer web clients require unified entry points. An API Gateway consolidates routing, authorization, rate limiting, and payload transformations.\n\nFor real-time applications, event streams push delta updates directly to subscribed view models. We discuss Optimistic UI updates, retry policies with backoff, and idempotent event consumers.`,
        keyTakeaway: 'Implement idempotent event handlers to prevent duplicate render passes during retry intervals.',
        pageOffset: 28
      },
      {
        chapterNumber: 3,
        title: 'Caching Strategies & Client Storage',
        subtitle: 'IndexedDB, Service Workers, and Memory Stores',
        content: `Latency is the single greatest performance thief in web applications. Stale-while-revalidate protocols combined with client-side IndexedDB caching allow applications to load instantaneously even on degraded network conditions.\n\nWe analyze cache invalidation policies, TTL strategies, and atomic storage transactions across browser tabs.`,
        keyTakeaway: 'Always pair client storage with cryptographic checksums to detect corrupted cache payloads.',
        pageOffset: 45
      },
      {
        chapterNumber: 4,
        title: 'State Architecture for Complex Applications',
        subtitle: 'Isolation, Immutability, and Data Flows',
        content: `When designing state architecture for modern applications, isolation and predictability are fundamental. By restricting direct state mutation and leveraging pure data flows, frontend components remain easily testable and decoupled from business logic.\n\nGlobal state should be treated as a read-only projection stream derived from single-source-of-truth events. Transient local UI state must be contained within visual component boundaries.`,
        keyTakeaway: 'Keep component state local until global shared state is strictly required.',
        pageOffset: 68
      },
      {
        chapterNumber: 5,
        title: 'Resilience Patterns & Circuit Breakers',
        subtitle: 'Failing Gracefully Under Heavy Traffic',
        content: `When high traffic bursts crash downstream microservices, frontend applications must fail gracefully rather than freezing or rendering white screens.\n\nCircuit breakers detect repeated API errors, opening the circuit to trigger fallback responses and cached UI snapshots.`,
        keyTakeaway: 'Design fallback UI states for every external network dependency.',
        pageOffset: 92
      }
    ]
  },
  {
    title: 'The Silent Horizon',
    author: 'Shefali J.',
    edition: 'Edition 2026',
    price: 399,
    formats: ['EPUB'],
    deliveryTag: 'Instant Delivery',
    status: 'Published',
    featured: true,
    tag: 'FEATURED',
    readingMood: 'Philosophical Engineering & Minimalism',
    pageCount: 145,
    rating: 4.8,
    synopsis: 'An editorial exploration of minimalist software design, deep work habits, and building timeless digital craft in an era of constant distraction.',
    coverGradient: 'linear-gradient(135deg, #2d5a47 0%, #1f3a2e 100%)',
    coverColor: '#2d5a47',
    sampleChapter: {
      chapterNumber: 1,
      title: 'The Noise of Complexity',
      subtitle: 'Why Less Code is Our Most Valuable Asset',
      content: `We live in an age of hyper-abstraction. Frameworks wrapped in build tools wrapped in container orchestration often conceal simple core problems.\n\nSimplicity requires deliberate restraint. Writing fewer lines of elegant, well-understood code reduces long-term maintenance debt and unlocks true clarity of thought.`,
      keyTakeaway: 'Simplicity is not the absence of features, but the mastery of necessity.',
      pageOffset: 10
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Noise of Complexity',
        subtitle: 'Why Less Code is Our Most Valuable Asset',
        content: `We live in an age of hyper-abstraction. Frameworks wrapped in build tools wrapped in container orchestration often conceal simple core problems.\n\nSimplicity requires deliberate restraint. Writing fewer lines of elegant, well-understood code reduces long-term maintenance debt and unlocks true clarity of thought.`,
        keyTakeaway: 'Simplicity is not the absence of features, but the mastery of necessity.',
        pageOffset: 10
      },
      {
        chapterNumber: 2,
        title: 'Craftsmanship & Focus',
        subtitle: 'Sustained Deep Work in Tech',
        content: `Building exceptional software demands long stretches of unbroken focus. Context switching destroys cognitive momentum and introduces subtle logic bugs.\n\nCreate environments that respect flow state, reduce unnecessary notifications, and prioritize deep analytical thinking.`,
        keyTakeaway: 'Guard your deep work hours as your highest engineering leverage.',
        pageOffset: 35
      }
    ]
  },
  {
    title: 'Modern CSS Architecture',
    author: 'Shefali J.',
    edition: 'Edition 2026',
    price: 299,
    formats: ['EPUB'],
    deliveryTag: 'Instant Delivery',
    status: 'Published',
    featured: false,
    tag: 'CSS TRICKS',
    readingMood: 'Design Systems & Layout Craftsmanship',
    pageCount: 160,
    rating: 4.9,
    synopsis: 'Master modern CSS layout algorithms, CSS custom properties, container queries, fluid typography, and building scalably themed web design systems.',
    coverGradient: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    coverColor: '#1c1917',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Container Queries & Component Independence',
      subtitle: 'Beyond Viewport Media Queries',
      content: `For a decade, responsive design relied solely on viewport width. Container queries flip this paradigm by allowing UI elements to respond directly to their parent container size.\n\nThis empowers developers to craft truly self-contained components that adapt whether rendered inside a narrow sidebar or a full-width hero canvas.`,
      keyTakeaway: 'Container queries enable true component-driven responsive design.',
      pageOffset: 15
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'Container Queries & Component Independence',
        subtitle: 'Beyond Viewport Media Queries',
        content: `For a decade, responsive design relied solely on viewport width. Container queries flip this paradigm by allowing UI elements to respond directly to their parent container size.\n\nThis empowers developers to craft truly self-contained components that adapt whether rendered inside a narrow sidebar or a full-width hero canvas.`,
        keyTakeaway: 'Container queries enable true component-driven responsive design.',
        pageOffset: 15
      },
      {
        chapterNumber: 2,
        title: 'Fluid Typography & Design Token Systems',
        subtitle: 'Mathematical Scaling Without Breakpoints',
        content: `Using CSS clamp() functions, layout dimensions and typography scale smoothly across screen resolutions without step-function media query jumps.`,
        keyTakeaway: 'Mathematical fluid typography ensures visually balanced design hierarchies on any device.',
        pageOffset: 40
      }
    ]
  },
  {
    title: 'Python Guide',
    author: 'Shefali J.',
    edition: 'Edition 2026',
    price: 449,
    formats: ['EPUB', 'PDF'],
    deliveryTag: 'Instant Delivery',
    status: 'Published',
    featured: false,
    tag: 'PYTHON',
    readingMood: 'Backend Performance & Data Engineering',
    pageCount: 220,
    rating: 4.7,
    synopsis: 'Comprehensive handbook covering Python 3.12+ async concurrency, type annotations, memory optimization, and building high-throughput microservices.',
    coverGradient: 'linear-gradient(135deg, #2e4a3e 0%, #1b3329 100%)',
    coverColor: '#2e4a3e',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Asyncio Core Internals',
      subtitle: 'Event Loops, Coroutines, and Non-blocking I/O',
      content: `Python asyncio provides single-threaded concurrency through cooperative multitasking. Understanding event loop scheduling and task creation is essential for building scalable network servers.`,
      keyTakeaway: 'Never execute CPU-bound blocking operations directly inside the main asyncio loop.',
      pageOffset: 14
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'Asyncio Core Internals',
        subtitle: 'Event Loops, Coroutines, and Non-blocking I/O',
        content: `Python asyncio provides single-threaded concurrency through cooperative multitasking. Understanding event loop scheduling and task creation is essential for building scalable network servers.`,
        keyTakeaway: 'Never execute CPU-bound blocking operations directly inside the main asyncio loop.',
        pageOffset: 14
      }
    ]
  },
  {
    title: 'React Performance Secrets',
    author: 'Shefali J.',
    edition: 'Edition 2026',
    price: 349,
    formats: ['PDF'],
    deliveryTag: 'Instant Delivery',
    status: 'Draft',
    featured: false,
    tag: 'SYSTEMS',
    readingMood: 'Render Tree Optimization & Memory Profiles',
    pageCount: 130,
    rating: 4.6,
    synopsis: 'Advanced profiling techniques for React applications. Diagnose redundant re-renders, memory leaks, bundle split strategies, and custom hook memos.',
    coverGradient: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
    coverColor: '#b45309',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Profiling Render Passes with React DevTools',
      subtitle: 'Identifying Flamegraph Bottlenecks',
      content: `Understanding why a component re-rendered is the first step in performance optimization. Use React DevTools profiler to measure commit durations and identify heavy re-renders.`,
      keyTakeaway: 'Profile before optimizing—never introduce useMemo without measuring baseline performance.',
      pageOffset: 8
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'Profiling Render Passes with React DevTools',
        subtitle: 'Identifying Flamegraph Bottlenecks',
        content: `Understanding why a component re-rendered is the first step in performance optimization. Use React DevTools profiler to measure commit durations and identify heavy re-renders.`,
        keyTakeaway: 'Profile before optimizing—never introduce useMemo without measuring baseline performance.',
        pageOffset: 8
      }
    ]
  }
];

const seedData = async () => {
  try {
    // Only seed if the database is empty (no books found)
    const existingBooks = await Book.countDocuments();
    if (existingBooks > 0) {
      console.log('[Seed] Database already has data, skipping seed.');
      return;
    }

    console.log('[Seed] Empty database detected. Inserting initial book catalog...');
    const insertedBooks = await Book.insertMany(initialBooks);

    const systemDesignBook = insertedBooks.find(b => b.title === 'System Design Masterclass');
    const cssBook = insertedBooks.find(b => b.title === 'Modern CSS Architecture');
    const pythonBook = insertedBooks.find(b => b.title === 'Python Guide');

    // Create Admin User & Default Customer User
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedCustomerPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Shefali Jangid',
      email: 'admin@sefali.library',
      password: hashedAdminPassword,
      role: 'admin'
    });

    const customerUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: hashedCustomerPassword,
      role: 'customer',
      purchasedBooks: [systemDesignBook._id, cssBook._id],
      readingProgress: [
        {
          bookId: systemDesignBook._id,
          chapterNumber: 5,
          lastPage: 42,
          percentage: 68,
          completed: false
        },
        {
          bookId: cssBook._id,
          chapterNumber: 2,
          lastPage: 160,
          percentage: 100,
          completed: true
        }
      ]
    });

    // Add initial reviews to books
    systemDesignBook.reviews = [
      {
        userId: customerUser._id,
        userName: 'Priya Sharma',
        rating: 5,
        comment: 'Must-read for staff engineers! The chapter on distributed circuit breakers saved our web client during peak deployment.',
        createdAt: new Date('2026-03-21T10:00:00')
      },
      {
        userId: adminUser._id,
        userName: 'Vikram Seth',
        rating: 5,
        comment: 'Extremely clear breakdown of state architecture and client caching protocols.',
        createdAt: new Date('2026-03-18T14:20:00')
      }
    ];
    systemDesignBook.rating = 5.0;
    await systemDesignBook.save();

    cssBook.reviews = [
      {
        userId: customerUser._id,
        userName: 'Aarav Mehta',
        rating: 5,
        comment: 'Container queries section changed how our design system components are constructed!',
        createdAt: new Date('2026-03-20T16:45:00')
      }
    ];
    cssBook.rating = 5.0;
    await cssBook.save();

    // Create Initial Orders
    await Order.create([
      {
        orderNumber: '#1042',
        user: customerUser._id,
        customerName: 'Priya Sharma',
        customerEmail: 'priya.sharma@example.com',
        book: systemDesignBook._id,
        bookTitle: 'System Design Masterclass',
        amount: 499,
        paymentMethod: 'UPI ID (priya@upi)',
        status: 'Paid',
        createdAt: new Date('2026-03-22T14:30:00')
      },
      {
        orderNumber: '#1041',
        user: customerUser._id,
        customerName: 'Aarav Mehta',
        customerEmail: 'aarav.mehta@example.com',
        book: cssBook._id,
        bookTitle: 'Modern CSS Architecture',
        amount: 299,
        paymentMethod: 'Credit Card',
        status: 'Paid',
        createdAt: new Date('2026-03-21T11:15:00')
      },
      {
        orderNumber: '#1040',
        user: customerUser._id,
        customerName: 'Karan Verma',
        customerEmail: 'karan.v@example.com',
        book: pythonBook._id,
        bookTitle: 'Python Guide',
        amount: 449,
        paymentMethod: 'Netbanking',
        status: 'Paid',
        createdAt: new Date('2026-03-20T09:45:00')
      }
    ]);

    console.log('[Seed] Database successfully seeded with books, users, and orders!');
    console.log('[Seed] Admin login:    admin@sefali.library / admin123');
    console.log('[Seed] Customer login: priya.sharma@example.com / password123');
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
  }
};

module.exports = seedData;

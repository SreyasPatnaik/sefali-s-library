const bcrypt = require('bcryptjs');
const Book = require('../models/Book');
const User = require('../models/User');
const Order = require('../models/Order');

const initialProducts = [
  {
    title: 'Crimson Betta Art Piece',
    author: 'Shefali Jangid Studio',
    category: 'Art & Sculptures',
    edition: 'Collector Edition 2026',
    price: 2800,
    originalPrice: 3400,
    formats: ['PHYSICAL', 'STANDARD'],
    deliveryTag: 'Free Studio Delivery',
    status: 'Published',
    featured: true,
    tag: 'ART',
    readingMood: 'Sculptural Art · Organic Fluidity',
    pageCount: 1,
    stockQuantity: 12,
    inStock: true,
    rating: 5.0,
    synopsis: 'A mesmerizing hand-sculpted piece depicting the weightless fluidity of a Siamese fighting fish. Cast in crystal resin with luminous crimson mineral pigments.',
    description: 'Each Betta art piece is sculpted and poured by hand in our studio. The flowing fins capture light in dynamic gradients, creating a contemplative aura of serenity and movement.',
    materials: 'High-clarity optical resin, crimson mineral powders, brushed obsidian base',
    dimensions: '24cm x 16cm x 12cm',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'
    ],
    coverGradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
    coverColor: '#b91c1c',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Artisan Notes & Care',
      subtitle: 'Preserving Resin Luminosity',
      content: 'Wipe gently with a microfiber cloth. Avoid prolonged direct UV exposure to maintain the deep translucent crimson hue.',
      keyTakeaway: 'Handcrafted individual piece with signed certificate of studio provenance.',
      pageOffset: 1
    }
  },
  {
    title: 'Emerald Textured Atelier Handbag',
    author: 'The Shefalis Atelier',
    category: 'Bags & Leather',
    edition: 'Atelier Series 2026',
    price: 3650,
    originalPrice: 4500,
    formats: ['PHYSICAL', 'STANDARD'],
    deliveryTag: 'Express Insured Courier',
    status: 'Published',
    featured: true,
    tag: 'LEATHER',
    readingMood: 'Luxury Craft · Vegetable-Tanned Leather',
    pageCount: 1,
    stockQuantity: 8,
    inStock: true,
    rating: 4.9,
    synopsis: 'Structured silhouette crafted in embossed emerald Italian leather. Features brushed golden hardware, rolled top handle, and magnetic lock closure.',
    description: 'Meticulously hand-stitched by master artisans, this emerald satchel embodies timeless architectural form and modern utility. Fully lined with sand cotton-canvas.',
    materials: 'Embossed vegetable-tanned grain leather, solid brass clasp, natural cotton twill lining',
    dimensions: '28cm x 20cm x 10cm (Drop: 12cm)',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    coverGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
    coverColor: '#047857',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Leather Provenance & Care',
      subtitle: 'Natural Aging & Conditioning',
      content: 'Our vegetable-tanned leather will develop a rich, lustrous patina over time. Condition twice annually with natural beeswax balm.',
      keyTakeaway: 'Includes custom organic linen dust bag and authenticity card.',
      pageOffset: 1
    }
  },
  {
    title: 'Astral Studio Art Figurine',
    author: 'Shefali Studio Editions',
    category: 'Art & Sculptures',
    edition: 'Limited Run of 50',
    price: 4200,
    originalPrice: 5000,
    formats: ['PHYSICAL', 'STANDARD'],
    deliveryTag: 'Insured Courier Delivery',
    status: 'Published',
    featured: true,
    tag: 'COLLECTIBLE',
    readingMood: 'Pop Art & Futuristic Nostalgia',
    pageCount: 1,
    stockQuantity: 15,
    inStock: true,
    rating: 4.8,
    synopsis: 'A bold, hand-finished art toy celebrating celestial exploration and urban art toys culture. Matte polyurethane with glossy visor detailing.',
    description: 'Designed as a dialogue between childhood cosmic imagination and contemporary sculptural design. Each figurine is individually numbered on the foot base.',
    materials: 'High-density vinyl composite, polyurethane lacquer, magnetic helmet accents',
    dimensions: '30cm x 15cm x 14cm',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
    ],
    coverGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    coverColor: '#312e81',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Collector Edition Certificate',
      subtitle: 'Edition 24 / 50',
      content: 'Shipped in custom foil-stamped presentation box with certificate of authenticity.',
      keyTakeaway: 'Signed by lead designer Shefali Jangid.',
      pageOffset: 1
    }
  },
  {
    title: 'Ochre Ribbed Ceramic Vase',
    author: 'The Shefalis Space',
    category: 'Ceramics & Pottery',
    edition: 'Studio Classic',
    price: 1850,
    originalPrice: 2200,
    formats: ['PHYSICAL', 'STANDARD'],
    deliveryTag: 'Fragile Boxed Delivery',
    status: 'Published',
    featured: false,
    tag: 'CERAMICS',
    readingMood: 'Wabi-Sabi Stoneware',
    pageCount: 1,
    stockQuantity: 20,
    inStock: true,
    rating: 4.9,
    synopsis: 'Wheel-thrown stoneware vase with tactile vertical grooves and matte warm ochre glaze. Ideal for botanical arrangements or solo sculpture.',
    description: 'Thrown on a slow potter’s wheel in our Jaipur studio using local iron-rich clay. Fired twice at 1220°C for exceptional durability and water tightness.',
    materials: 'Iron-rich stoneware clay, non-toxic matte mineral glaze',
    dimensions: '22cm height, 14cm diameter',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80'
    ],
    coverGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)',
    coverColor: '#b45309',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Ceramic Care & Handling',
      subtitle: 'Hand-wash Only',
      content: 'Waterproof interior. Rinse with warm soapy water and air dry thoroughly.',
      keyTakeaway: 'Each vessel exhibits natural variations in glaze depth and ribbing.',
      pageOffset: 1
    }
  },
  {
    title: 'Zen Sandstone Incense Burner',
    author: 'The Shefalis Space',
    category: 'Studio Decor',
    edition: 'Meditation Series',
    price: 1290,
    originalPrice: 1600,
    formats: ['PHYSICAL', 'STANDARD'],
    deliveryTag: 'Standard Delivery',
    status: 'Published',
    featured: false,
    tag: 'DECOR',
    readingMood: 'Ritual & Mindful Living',
    pageCount: 1,
    stockQuantity: 30,
    inStock: true,
    rating: 4.9,
    synopsis: 'Minimalist carved sandstone vessel with dual brass incense pin and palo santo cradle for mindful daily grounding.',
    description: 'Hand-hewn from natural dessert sandstone with smooth curved hollows designed to catch every trace of falling ash effortlessly.',
    materials: 'Natural carved sandstone, solid spun brass',
    dimensions: '18cm x 8cm x 3.5cm',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80'
    ],
    coverGradient: 'linear-gradient(135deg, #44403c 0%, #78716c 100%)',
    coverColor: '#78716c',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Aromatherapy Guide',
      subtitle: 'Mindful Morning Rituals',
      content: 'Compatible with standard stick incense, dhoop cones, and sacred woods.',
      keyTakeaway: 'Includes starter pack of artisanal sandalwood incense sticks.',
      pageOffset: 1
    }
  },
  {
    title: 'Artisanal Butter Linen Throw',
    author: 'The Shefalis Space',
    category: 'Lifestyle & Living',
    edition: 'Textile Collection',
    price: 2450,
    originalPrice: 3100,
    formats: ['PHYSICAL', 'STANDARD'],
    deliveryTag: 'Eco Gift Packaged',
    status: 'Published',
    featured: false,
    tag: 'TEXTILES',
    readingMood: 'Soft Living & Natural Fibers',
    pageCount: 1,
    stockQuantity: 14,
    inStock: true,
    rating: 4.7,
    synopsis: 'Ultra-soft handwoven 100% Belgian flax linen throw blanket in soft warm butter yellow with hand-knotted eyelash fringe.',
    description: 'Woven on traditional pit-looms by regional artisans. Pre-washed with natural river stones for a supple, lived-in drape that softens with every wash.',
    materials: '100% Certified organic Belgian flax linen',
    dimensions: '140cm x 190cm',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
    ],
    coverGradient: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
    coverColor: '#eab308',
    sampleChapter: {
      chapterNumber: 1,
      title: 'Linen Care Instructions',
      subtitle: 'Gentle Machine Wash',
      content: 'Wash on gentle cycle in cool water. Tumble dry low or line dry in the breeze to preserve natural linen texture.',
      keyTakeaway: 'Thermoregulating linen stays cool in summer and cozy in winter.',
      pageOffset: 1
    }
  }
];

const seedData = async () => {
  try {
    const existingCount = await Book.countDocuments();
    // If database already contains books with old book titles, clear and reseed with studio products
    const sampleOld = await Book.findOne({ title: 'System Design Masterclass' });
    if (existingCount > 0 && !sampleOld) {
      console.log('[Seed] Database already initialized with studio collection.');
      return;
    }

    if (sampleOld) {
      console.log('[Seed] Upgrading database catalog from library books to e-commerce studio products...');
      await Book.deleteMany({});
      await Order.deleteMany({});
    }

    console.log('[Seed] Seeding curated design studio products...');
    const insertedProducts = await Book.insertMany(initialProducts);

    const bettaArt = insertedProducts.find(p => p.title === 'Crimson Betta Art Piece');
    const bagItem = insertedProducts.find(p => p.title === 'Emerald Textured Atelier Handbag');
    const vaseItem = insertedProducts.find(p => p.title === 'Ochre Ribbed Ceramic Vase');

    // Create Admin User & Default Customer User
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedCustomerPassword = await bcrypt.hash('password123', 10);

    let adminUser = await User.findOne({ email: 'admin@theshefalisspace.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Shefali Jangid',
        email: 'admin@theshefalisspace.com',
        password: hashedAdminPassword,
        role: 'admin'
      });
    }

    let customerUser = await User.findOne({ email: 'priya.sharma@example.com' });
    if (!customerUser) {
      customerUser = await User.create({
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: hashedCustomerPassword,
        role: 'customer',
        purchasedBooks: [bettaArt._id, bagItem._id]
      });
    }

    // Add initial product reviews
    if (bettaArt && customerUser) {
      bettaArt.reviews = [
        {
          userId: customerUser._id,
          userName: 'Priya Sharma',
          rating: 5,
          comment: 'The resin clarity and crimson fluidity are even more stunning in person! Truly a centerpiece for my living room.',
          createdAt: new Date('2026-03-21T10:00:00')
        }
      ];
      await bettaArt.save();
    }

    if (bagItem && customerUser) {
      bagItem.reviews = [
        {
          userId: customerUser._id,
          userName: 'Ananya Roy',
          rating: 5,
          comment: 'The emerald leather texture and gold hardware feel like luxury couture. Exceptional craftsmanship!',
          createdAt: new Date('2026-03-22T14:20:00')
        }
      ];
      await bagItem.save();
    }

    // Initial Orders
    if (bettaArt && bagItem && vaseItem && customerUser) {
      await Order.create([
        {
          orderNumber: '#SH-1042',
          user: customerUser._id,
          customerName: 'Priya Sharma',
          customerEmail: 'priya.sharma@example.com',
          book: bettaArt._id,
          bookTitle: 'Crimson Betta Art Piece',
          amount: 2800,
          paymentMethod: 'UPI ID (priya@okhdfcbank)',
          status: 'Paid',
          createdAt: new Date('2026-03-22T14:30:00')
        },
        {
          orderNumber: '#SH-1041',
          user: customerUser._id,
          customerName: 'Ananya Roy',
          customerEmail: 'ananya.roy@example.com',
          book: bagItem._id,
          bookTitle: 'Emerald Textured Atelier Handbag',
          amount: 3650,
          paymentMethod: 'Credit Card (Visa •••• 4242)',
          status: 'Paid',
          createdAt: new Date('2026-03-21T11:15:00')
        },
        {
          orderNumber: '#SH-1040',
          user: customerUser._id,
          customerName: 'Karan Verma',
          customerEmail: 'karan.v@example.com',
          book: vaseItem._id,
          bookTitle: 'Ochre Ribbed Ceramic Vase',
          amount: 1850,
          paymentMethod: 'UPI QR Code',
          status: 'Paid',
          createdAt: new Date('2026-03-20T09:45:00')
        }
      ]);
    }

    console.log('[Seed] Design Studio database successfully populated!');
    console.log('[Seed] Admin Credentials: admin@theshefalisspace.com / admin123 (or access via URL ".admin")');
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
  }
};

module.exports = seedData;

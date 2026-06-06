import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data in dependency order
  await prisma.planActivity.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.activity.deleteMany();

  const activities = await prisma.activity.createManyAndReturn({
    data: [
      {
        id: 'act_001',
        title: 'Nike Art Gallery',
        category: 'Culture',
        area: 'Lekki',
        durationMinutes: 90,
        priceLevel: 2,
        rating: 4.7,
        imageUrl:
          'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80',
        description:
          'One of Africa\'s largest private art collections, housing over 7,000 Nigerian artworks spanning centuries of traditional and contemporary pieces. Founded by Nike Davies-Okundaye, the gallery spans five floors and is a vibrant hub for art enthusiasts, students, and tourists visiting Lagos.',
        tags: ['art', 'gallery', 'culture', 'contemporary', 'African art', 'crafts'],
      },
      {
        id: 'act_002',
        title: 'Lekki Conservation Centre',
        category: 'Nature',
        area: 'Lekki',
        durationMinutes: 150,
        priceLevel: 2,
        rating: 4.8,
        imageUrl:
          'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
        description:
          'A 78-hectare urban nature reserve managed by the Nigerian Conservation Foundation. The centrepiece is Africa\'s longest canopy walkway at 401 metres, offering breathtaking views of mangrove swamps, wildlife, and the Lagos skyline. Home to crocodiles, monkeys, and over 100 bird species.',
        tags: ['nature', 'wildlife', 'canopy walk', 'conservation', 'birds', 'eco-tourism'],
      },
      {
        id: 'act_003',
        title: 'Tarkwa Bay Beach',
        category: 'Beach',
        area: 'Lagos Harbour',
        durationMinutes: 240,
        priceLevel: 3,
        rating: 4.6,
        imageUrl:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        description:
          'A sheltered lagoon beach accessible only by boat from Bar Beach or Five Cowrie Creek. Known for its calm, safe waters ideal for swimming, jet skiing, and beach volleyball. The 15-minute boat ride is itself part of the experience, and the beach offers a tranquil escape from the city bustle.',
        tags: ['beach', 'swimming', 'relaxation', 'boat ride', 'watersports', 'sunset'],
      },
      {
        id: 'act_004',
        title: 'Terra Kulture',
        category: 'Culture',
        area: 'Victoria Island',
        durationMinutes: 120,
        priceLevel: 3,
        rating: 4.5,
        imageUrl:
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
        description:
          'A premier arts and culture centre on Victoria Island combining a theatre, art gallery, language school, library, restaurant, and craft shop under one roof. A cultural anchor of Lagos, hosting regular art exhibitions, Yoruba language classes, live theatre performances, and culinary events celebrating Nigerian heritage.',
        tags: ['culture', 'art', 'theatre', 'restaurant', 'language', 'heritage'],
      },
      {
        id: 'act_005',
        title: 'Freedom Park',
        category: 'History',
        area: 'Lagos Island',
        durationMinutes: 90,
        priceLevel: 1,
        rating: 4.4,
        imageUrl:
          'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80',
        description:
          'Built on the site of Lagos\'s colonial-era Her Majesty\'s Prison (HMP Broad Street), Freedom Park is a living heritage site and open-air arts and music venue on Lagos Island. Its meticulously preserved Victorian-era prison cells and courtyards now host concerts, art installations, and cultural events against a powerful historical backdrop.',
        tags: ['history', 'music', 'outdoor', 'heritage', 'colonial', 'concerts'],
      },
      {
        id: 'act_006',
        title: 'Balogun Market',
        category: 'Shopping',
        area: 'Lagos Island',
        durationMinutes: 120,
        priceLevel: 1,
        rating: 4.2,
        imageUrl:
          'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
        description:
          'West Africa\'s largest open-air market, a sensory kaleidoscope of colour, sound, and commerce spread across dozens of streets in the heart of Lagos Island. Famous for fabrics — particularly ankara, lace, and aso-oke — alongside electronics, clothes, shoes, and street food. Bargaining is expected and rewarded.',
        tags: ['shopping', 'market', 'fabric', 'ankara', 'street food', 'bargaining'],
      },
      {
        id: 'act_007',
        title: 'Jazzhole',
        category: 'Music & Books',
        area: 'Ikoyi',
        durationMinutes: 60,
        priceLevel: 2,
        rating: 4.9,
        imageUrl:
          'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
        description:
          'An iconic Lagos cultural institution since 1993, Jazzhole is a record shop, bookstore, and cultural space rolled into one intimate Ikoyi townhouse. Renowned for its curated collection of Afrobeat, jazz, and world music vinyl records alongside rare books on African art, literature, and history. A beloved gathering point for Lagos\'s creative community.',
        tags: ['music', 'books', 'jazz', 'Afrobeat', 'vinyl', 'culture', 'records'],
      },
    ],
  });

  console.log(`✅ Created ${activities.length} activities`);

  // Create a sample plan
  const plan = await prisma.plan.create({
    data: {
      id: 'plan_sample_01',
      name: 'Lagos Culture & Nature Day',
      date: new Date('2025-07-15'),
      notes: 'Start with the art gallery in the morning, then head to the conservation centre in the afternoon.',
      activities: {
        create: [
          { activityId: 'act_001', order: 1 },
          { activityId: 'act_002', order: 2 },
          { activityId: 'act_005', order: 3 },
        ],
      },
    },
  });

  console.log(`✅ Created sample plan: ${plan.name}`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

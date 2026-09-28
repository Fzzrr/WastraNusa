import prisma from '../../src/lib/prisma';
import { SEED_ARTICLE_1, SEED_ARTICLE_2, SEED_ARTICLE_3 } from './article.seed';
import { SEED_SELLER_USER } from './user.seed';

export const SEED_PRODUCT_1 = {
  id: 'p0000000-0000-0000-0000-000000000001',
  articleId: SEED_ARTICLE_1.id,
  name: 'Batik Tulis Hokokai Pekalongan',
  slug: 'batik-tulis-hokokai-pekalongan',
  description:
    'Kemeja batik tulis terinspirasi motif Hokokai Pekalongan yang selaras dengan artikel batik utama.',
  price: 250000,
  sku: 'BTK-HOKO-001',
  weight: 300,
  island: SEED_ARTICLE_1.island,
  province: SEED_ARTICLE_1.province,
  clothingType: SEED_ARTICLE_1.clothingType,
  gender: SEED_ARTICLE_1.gender,
  imageURL: SEED_ARTICLE_1.imageURL,
  status: 'active' as const,
};

export const SEED_PRODUCT_2 = {
  id: 'p0000000-0000-0000-0000-000000000002',
  articleId: SEED_ARTICLE_2.id,
  name: 'Ulos Batak Mangulosi',
  slug: 'ulos-batak-mangulosi',
  description:
    'Selendang ulos tenun yang mengikuti tema artikel ulos dan tradisi mangulosi Batak.',
  price: 150000,
  sku: 'ULS-MGLS-001',
  weight: 200,
  island: SEED_ARTICLE_2.island,
  province: SEED_ARTICLE_2.province,
  clothingType: SEED_ARTICLE_2.clothingType,
  gender: SEED_ARTICLE_2.gender,
  imageURL: SEED_ARTICLE_2.imageURL,
  status: 'active' as const,
};

export const SEED_PRODUCT_3 = {
  id: 'p0000000-0000-0000-0000-000000000003',
  articleId: SEED_ARTICLE_3.id,
  name: 'Selendang Ikat Nusa Tenggara',
  slug: 'selendang-ikat-nusa-tenggara',
  description:
    'Selendang ikat yang mengikuti artikel teknik ikat dengan karakter motif benang pra-tenun.',
  price: 185000,
  sku: 'IKT-NTT-001',
  weight: 180,
  island: SEED_ARTICLE_3.island,
  province: SEED_ARTICLE_3.province,
  clothingType: SEED_ARTICLE_3.clothingType,
  gender: SEED_ARTICLE_3.gender,
  imageURL: SEED_ARTICLE_3.imageURL,
  status: 'active' as const,
};

export const SEED_PRODUCT_4 = {
  id: 'p0000000-0000-0000-0000-000000000004',
  articleId: 'b0000000-0000-0000-0000-000000000004',
  name: 'Songket Palembang Premium',
  slug: 'songket-palembang-premium',
  description:
    'Kain songket premium yang diselaraskan dengan artikel songket dan tradisi Palembang.',
  price: 425000,
  sku: 'SGK-PLB-001',
  weight: 320,
  island: 'Sumatera',
  province: 'Sumatera Selatan',
  clothingType: 'Songket',
  gender: 'female' as const,
  imageURL:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Bamboofabric.png',
  status: 'active' as const,
};

export const SEED_PRODUCT_5 = {
  id: 'p0000000-0000-0000-0000-000000000005',
  articleId: 'b0000000-0000-0000-0000-000000000005',
  name: 'Kebaya Kartini Brokat',
  slug: 'kebaya-kartini-brokat',
  description:
    'Kebaya brokat modern yang mengikuti artikel kebaya sebagai busana perempuan maritim Asia Tenggara.',
  price: 310000,
  sku: 'KBY-KRT-001',
  weight: 250,
  island: 'Jawa',
  province: 'DI Yogyakarta',
  clothingType: 'Kebaya',
  gender: 'female' as const,
  imageURL:
    'https://commons.wikimedia.org/wiki/Special:FilePath/GKR_Hayu_2.jpg',
  status: 'active' as const,
};

export const SEED_PRODUCT_6 = {
  id: 'p0000000-0000-0000-0000-000000000006',
  articleId: 'b0000000-0000-0000-0000-000000000006',
  name: 'Kain Geringsing Tenganan',
  slug: 'kain-geringsing-tenganan',
  description:
    'Kain geringsing Bali Aga yang disesuaikan dengan artikel double ikat sakral dari Tenganan.',
  price: 395000,
  sku: 'GRG-TGN-001',
  weight: 220,
  island: 'Bali',
  province: 'Bali',
  clothingType: 'Geringsing',
  gender: 'female' as const,
  imageURL:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Geringsingi_texttile_in_use.jpg',
  status: 'active' as const,
};

export const SEED_PRODUCT_7 = {
  id: 'p0000000-0000-0000-0000-000000000007',
  articleId: 'b0000000-0000-0000-0000-000000000007',
  name: 'Kain Tapis Lampung',
  slug: 'kain-tapis-lampung',
  description:
    'Kain tapis dengan aksen benang emas yang mengikuti artikel tapis Lampung.',
  price: 275000,
  sku: 'TPS-LPG-001',
  weight: 210,
  island: 'Sumatera',
  province: 'Lampung',
  clothingType: 'Tapis',
  gender: 'female' as const,
  imageURL:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Kain_tapis.JPG',
  status: 'active' as const,
};

export const SEED_VARIANT_1_1 = {
  id: 'v0000000-0000-0000-0000-000000000011',
  productId: SEED_PRODUCT_1.id,
  name: 'Size L',
  type: 'size' as const,
  price: 250000,
  stock: 20,
  sku: 'BTK-HOKO-L',
  imageURL: SEED_PRODUCT_1.imageURL,
};

export const SEED_VARIANT_1_2 = {
  id: 'v0000000-0000-0000-0000-000000000012',
  productId: SEED_PRODUCT_1.id,
  name: 'Size XL',
  type: 'size' as const,
  price: 275000,
  stock: 15,
  sku: 'BTK-HOKO-XL',
  imageURL: SEED_PRODUCT_1.imageURL,
};

export const SEED_VARIANT_2_1 = {
  id: 'v0000000-0000-0000-0000-000000000021',
  productId: SEED_PRODUCT_2.id,
  name: 'Default',
  type: 'size' as const,
  price: 150000,
  stock: 30,
  sku: 'ULS-MGLS-DEFAULT',
  imageURL: SEED_PRODUCT_2.imageURL,
};

export const SEED_VARIANT_3_1 = {
  id: 'v0000000-0000-0000-0000-000000000031',
  productId: SEED_PRODUCT_3.id,
  name: 'Default',
  type: 'size' as const,
  price: 185000,
  stock: 18,
  sku: 'IKT-NTT-DEFAULT',
  imageURL: SEED_PRODUCT_3.imageURL,
};

export const SEED_VARIANT_4_1 = {
  id: 'v0000000-0000-0000-0000-000000000041',
  productId: SEED_PRODUCT_4.id,
  name: '2 Meter',
  type: 'size' as const,
  price: 425000,
  stock: 10,
  sku: 'SGK-PLB-2M',
  imageURL: SEED_PRODUCT_4.imageURL,
};

export const SEED_VARIANT_5_1 = {
  id: 'v0000000-0000-0000-0000-000000000051',
  productId: SEED_PRODUCT_5.id,
  name: 'Size M',
  type: 'size' as const,
  price: 310000,
  stock: 12,
  sku: 'KBY-KRT-M',
  imageURL: SEED_PRODUCT_5.imageURL,
};

export const SEED_VARIANT_6_1 = {
  id: 'v0000000-0000-0000-0000-000000000061',
  productId: SEED_PRODUCT_6.id,
  name: 'Default',
  type: 'size' as const,
  price: 395000,
  stock: 8,
  sku: 'GRG-TGN-DEFAULT',
  imageURL: SEED_PRODUCT_6.imageURL,
};

export const SEED_VARIANT_7_1 = {
  id: 'v0000000-0000-0000-0000-000000000071',
  productId: SEED_PRODUCT_7.id,
  name: 'Default',
  type: 'size' as const,
  price: 275000,
  stock: 14,
  sku: 'TPS-LPG-DEFAULT',
  imageURL: SEED_PRODUCT_7.imageURL,
};

export async function seedProducts() {
  // All seed products are owned by the seed seller so the seller-scoped
  // inventory/orders/dashboard views have data on a fresh database.
  const seller = await prisma.user.findFirst({
    where: { email: SEED_SELLER_USER.email },
  });

  if (!seller) {
    throw new Error(
      'Seed seller not found. Run seedUsers before seedProducts.',
    );
  }

  const products = [
    SEED_PRODUCT_1,
    SEED_PRODUCT_2,
    SEED_PRODUCT_3,
    SEED_PRODUCT_4,
    SEED_PRODUCT_5,
    SEED_PRODUCT_6,
    SEED_PRODUCT_7,
  ];
  const variants = [
    SEED_VARIANT_1_1,
    SEED_VARIANT_1_2,
    SEED_VARIANT_2_1,
    SEED_VARIANT_3_1,
    SEED_VARIANT_4_1,
    SEED_VARIANT_5_1,
    SEED_VARIANT_6_1,
    SEED_VARIANT_7_1,
  ];

  await prisma.$transaction(async (tx) => {
    for (const prod of products) {
      const data = { ...prod, sellerId: seller.id };
      await tx.product.upsert({
        where: { id: prod.id },
        update: data,
        create: data,
      });
    }
    console.log(
      `Seeded ${products.length} products → ${SEED_SELLER_USER.email}`,
    );

    for (const variant of variants) {
      await tx.productVariant.upsert({
        where: { id: variant.id },
        update: variant,
        create: variant,
      });
    }
    console.log(`Seeded ${variants.length} product variants`);
  });
}

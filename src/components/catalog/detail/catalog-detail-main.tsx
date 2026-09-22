'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useArticleDetail } from '@/hooks/use-article';
import { useAddToCart, useCart, useUpdateCartItem } from '@/hooks/use-cart';
import { useProductCatalogDetail } from '@/hooks/use-product-catalog';
import { authClient } from '@/lib/auth/auth-client';
import { setCheckoutSession } from '@/lib/checkout-session';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getVariantResolvedPrice } from '../utils';
import { CatalogDetailBreadcrumb } from './catalog-detail-breadcrumb';
import { CatalogDetailContent, type DetailTab } from './catalog-detail-content';
import { CatalogDetailEncyclopedia } from './catalog-detail-encyclopedia';
import { CatalogDetailGallery } from './catalog-detail-gallery';
import { CatalogDetailProductSummary } from './catalog-detail-product-summary';

function CatalogDetailSkeleton() {
  return (
    <main className="border-t border-[#ddd4c5]">
      <section className="mx-auto w-full max-w-[1320px] px-4 pb-8 pt-6 md:px-6 lg:px-8">
        <Skeleton className="h-5 w-80 bg-[#e6dfd1]" />

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="space-y-3">
            <Skeleton className="h-[360px] w-full rounded-2xl bg-[#ece2d4]" />
            <div className="grid grid-cols-4 gap-2">
              <Skeleton className="h-20 rounded-lg bg-[#e6dfd1]" />
              <Skeleton className="h-20 rounded-lg bg-[#e6dfd1]" />
              <Skeleton className="h-20 rounded-lg bg-[#e6dfd1]" />
              <Skeleton className="h-20 rounded-lg bg-[#e6dfd1]" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-md bg-[#e6dfd1]" />
              <Skeleton className="h-6 w-24 rounded-md bg-[#e6dfd1]" />
            </div>
            <Skeleton className="h-12 w-3/4 bg-[#e6dfd1]" />
            <Skeleton className="h-4 w-2/3 bg-[#e6dfd1]" />
            <Skeleton className="h-4 w-32 bg-[#e6dfd1]" />
            <Skeleton className="h-24 w-full rounded-2xl bg-[#e6dfd1]" />
            <Skeleton className="h-16 w-full bg-[#e6dfd1]" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-full bg-[#e6dfd1]" />
              <Skeleton className="h-9 w-24 rounded-full bg-[#e6dfd1]" />
              <Skeleton className="h-9 w-24 rounded-full bg-[#e6dfd1]" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-14 rounded-lg bg-[#e6dfd1]" />
              <Skeleton className="h-10 w-14 rounded-lg bg-[#e6dfd1]" />
              <Skeleton className="h-10 w-14 rounded-lg bg-[#e6dfd1]" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-36 rounded-xl bg-[#e6dfd1]" />
              <Skeleton className="h-4 w-24 bg-[#e6dfd1]" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-11 rounded-xl bg-[#e6dfd1]" />
              <Skeleton className="h-11 rounded-xl bg-[#e6dfd1]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1320px] gap-4 px-4 pb-10 md:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3 rounded-2xl border border-[#d9d0c2] bg-[#f7f3ea] p-5">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24 bg-[#e6dfd1]" />
            <Skeleton className="h-8 w-24 bg-[#e6dfd1]" />
          </div>
          <Skeleton className="h-9 w-52 bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-full bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-11/12 bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-10/12 bg-[#e6dfd1]" />
          <div className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-16 rounded-xl bg-[#e6dfd1]" />
            <Skeleton className="h-16 rounded-xl bg-[#e6dfd1]" />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-[#ddd3c3] bg-[#f6f2e9] p-3">
          <Skeleton className="h-8 w-48 bg-[#e6dfd1]" />
          <Skeleton className="h-40 w-full rounded-xl bg-[#e6dfd1]" />
          <Skeleton className="h-7 w-3/4 bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-full bg-[#e6dfd1]" />
          <Skeleton className="h-4 w-11/12 bg-[#e6dfd1]" />
          <Skeleton className="h-24 w-full rounded-xl bg-[#e6dfd1]" />
          <Skeleton className="h-10 w-full rounded-xl bg-[#e6dfd1]" />
        </div>
      </section>
    </main>
  );
}

export function CatalogDetailMain({ slug }: { slug: string }) {
  const { data: product, error, isPending } = useProductCatalogDetail(slug);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { data: cart } = useCart({ enabled: Boolean(session) });
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>('deskripsi');
  const { data: linkedArticle, isPending: isLinkedArticlePending } =
    useArticleDetail(product?.articleId ?? '');

  const sizeVariants = useMemo(
    () => product?.variants.filter((variant) => variant.type === 'size') ?? [],
    [product],
  );
  const colorVariants = useMemo(
    () => product?.variants.filter((variant) => variant.type === 'color') ?? [],
    [product],
  );
  const effectiveSelectedSize = useMemo(() => {
    if (!selectedSize) {
      return sizeVariants[0]?.name;
    }

    return sizeVariants.some((variant) => variant.name === selectedSize)
      ? selectedSize
      : sizeVariants[0]?.name;
  }, [selectedSize, sizeVariants]);
  const effectiveSelectedColor = useMemo(() => {
    if (!selectedColor) {
      return colorVariants[0]?.name;
    }

    return colorVariants.some((variant) => variant.name === selectedColor)
      ? selectedColor
      : colorVariants[0]?.name;
  }, [colorVariants, selectedColor]);
  const selectedVariantId = useMemo(() => {
    const selectedSizeVariant = sizeVariants.find(
      (variant) => variant.name === effectiveSelectedSize,
    );
    if (selectedSizeVariant) {
      return selectedSizeVariant.id;
    }

    const selectedColorVariant = colorVariants.find(
      (variant) => variant.name === effectiveSelectedColor,
    );
    return selectedColorVariant?.id ?? null;
  }, [
    colorVariants,
    effectiveSelectedColor,
    effectiveSelectedSize,
    sizeVariants,
  ]);
  const selectedVariantStock = useMemo(() => {
    if (selectedVariantId) {
      return (
        product?.variants.find((variant) => variant.id === selectedVariantId)
          ?.stock ?? 0
      );
    }

    return product?.stock ?? 0;
  }, [product, selectedVariantId]);
  const selectedVariantPrice = useMemo(() => {
    const selectedVariant =
      product?.variants.find((variant) => variant.id === selectedVariantId) ??
      null;

    return getVariantResolvedPrice(selectedVariant, product?.price ?? 0);
  }, [product, selectedVariantId]);

  if (isPending && !product) {
    return <CatalogDetailSkeleton />;
  }

  if (!isPending && error) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <p className="text-sm text-[#8b5e4a]">
          Gagal memuat detail produk. Silakan coba lagi.
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <p className="text-sm text-[#8b5e4a]">Produk tidak ditemukan.</p>
      </main>
    );
  }

  const safeQuantity =
    selectedVariantStock > 0
      ? Math.min(Math.max(quantity, 1), selectedVariantStock)
      : 0;
  const isCartActionPending =
    addToCartMutation.isPending || updateCartItemMutation.isPending;
  const encyclopediaFacts: readonly [string, string][] = [
    ['Pulau Asal', product.island],
    ['Provinsi', product.province],
    [
      'Tanggal Diunggah',
      new Date(product.updatedAt).toLocaleDateString('id-ID'),
    ],
  ];

  const ensureAuthenticated = () => {
    if (!session && !isSessionPending) {
      toast.error('Silakan login terlebih dahulu untuk melanjutkan.');
      router.push('/login');
      return false;
    }

    return true;
  };

  const upsertCurrentItemToCart = async () => {
    if (!ensureAuthenticated()) {
      return null;
    }

    const existingItem = cart?.items.find(
      (item) =>
        item.productId === product.id &&
        item.variantId === (selectedVariantId ?? null),
    );

    if (existingItem) {
      const nextQuantity = Math.min(
        existingItem.quantity + safeQuantity,
        selectedVariantStock,
      );
      await updateCartItemMutation.mutateAsync({
        id: existingItem.id,
        data: {
          quantity: nextQuantity,
        },
      });

      return { cartItemId: existingItem.id };
    }

    const updatedCart = await addToCartMutation.mutateAsync({
      productId: product.id,
      variantId: selectedVariantId,
      quantity: safeQuantity,
    });

    const addedItem = updatedCart.items.find(
      (item) =>
        item.productId === product.id &&
        item.variantId === (selectedVariantId ?? null),
    );

    if (!addedItem) {
      throw new Error(
        'Item berhasil ditambahkan, tetapi tidak ditemukan di keranjang.',
      );
    }

    return { cartItemId: addedItem.id };
  };

  const handleAddToCart = async () => {
    try {
      const result = await upsertCurrentItemToCart();
      if (!result) {
        return;
      }
      toast.success('Produk berhasil ditambahkan ke keranjang.');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Gagal menambahkan produk ke keranjang.';
      toast.error(message);
    }
  };

  const handleBuyNow = async () => {
    try {
      const result = await upsertCurrentItemToCart();
      if (!result) {
        return;
      }

      const selectedVariant = selectedVariantId
        ? product.variants.find((variant) => variant.id === selectedVariantId)
        : undefined;

      setCheckoutSession({
        items: [
          {
            cartItemId: result.cartItemId,
            productId: product.id,
            variantId: selectedVariantId,
            name: product.name,
            variant:
              effectiveSelectedSize ?? effectiveSelectedColor ?? 'Default',
            price: selectedVariantPrice,
            quantity: safeQuantity,
            imageURL: selectedVariant?.imageURL ?? product.imageURL,
          },
        ],
        createdAt: new Date().toISOString(),
      });
      router.push('/cart/checkout');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Gagal memproses pembelian langsung.';
      toast.error(message);
    }
  };

  return (
    <main className="border-t border-[#ddd4c5]">
      <section className="mx-auto w-full max-w-[1320px] px-4 pb-8 pt-6 md:px-6 lg:px-8">
        <CatalogDetailBreadcrumb
          category={product.clothingType}
          name={product.name}
        />

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <CatalogDetailGallery
            category={product.clothingType}
            imageURL={product.imageURL}
          />
          <CatalogDetailProductSummary
            product={product}
            sizeOptions={sizeVariants}
            colorOptions={colorVariants}
            selectedColor={effectiveSelectedColor}
            selectedSize={effectiveSelectedSize}
            selectedVariantPrice={selectedVariantPrice}
            selectedVariantStock={selectedVariantStock}
            safeQuantity={safeQuantity}
            onColorChange={setSelectedColor}
            onSizeChange={setSelectedSize}
            onDecreaseQuantity={() =>
              setQuantity((value) => Math.max(1, value - 1))
            }
            onIncreaseQuantity={() =>
              setQuantity((value) =>
                Math.min(Math.max(1, selectedVariantStock), value + 1),
              )
            }
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isCartActionPending={isCartActionPending}
          />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1320px] gap-4 px-4 pb-10 md:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <CatalogDetailContent
          activeTab={activeTab}
          product={product}
          displayPrice={selectedVariantPrice}
          onTabChange={setActiveTab}
        />
        <CatalogDetailEncyclopedia
          encyclopediaFacts={encyclopediaFacts}
          category={product.clothingType}
          linkedArticle={linkedArticle}
          isLinkedArticlePending={isLinkedArticlePending}
        />
      </section>
    </main>
  );
}

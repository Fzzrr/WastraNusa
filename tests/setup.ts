import { cleanup } from '@testing-library/react';
import 'dotenv/config';
import { afterEach, vi } from 'vitest';

// vitest is not in `globals` mode, so React Testing Library's automatic
// afterEach cleanup is not registered. Without this, rendered components
// accumulate in document.body across tests (e.g. duplicate elements).
afterEach(() => {
  cleanup();
});

vi.mock('@/logger/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}));

vi.mock('@/lib/auth/auth-api-helper', () => ({
  AuthHelper: {
    getUser: vi.fn(),
    requireUser: vi.fn(),
    requireAdmin: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: vi.fn(async (callback?: unknown) => {
      if (typeof callback === 'function') {
        const tx = {
          order: { update: vi.fn() },
          paymentTransaction: { updateMany: vi.fn() },
          productVariant: { update: vi.fn() },
        };

        return callback(tx);
      }

      return [];
    }),
  },
}));

vi.mock('@/repositories/article.repository', () => ({
  articleRepository: {
    findChatArticle: vi.fn(),
    findAll: vi.fn(),
    countAll: vi.fn(),
    countByIsland: vi.fn(),
    countByTopic: vi.fn(),
    countDistinctMotifLabel: vi.fn(),
    countDistinctProvince: vi.fn(),
    findMostPopular: vi.fn(),
    findByIdOrSlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    incrementViewCount: vi.fn(),
    findUserLike: vi.fn(),
    countLikedByUser: vi.fn(),
    countCreatedSince: vi.fn(),
    findLikedByUser: vi.fn(),
    toggleLike: vi.fn(),
  },
}));

vi.mock('@/services/article.service', () => ({
  articleService: {
    getArticles: vi.fn(),
    getDashboardOverview: vi.fn(),
    getArticleDetail: vi.fn(),
    getLikedArticles: vi.fn(),
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
    deleteArticle: vi.fn(),
    toggleLike: vi.fn(),
  },
}));

vi.mock('@/repositories/order.repository', () => ({
  orderRepository: {
    createOrder: vi.fn(),
    findOrderById: vi.fn(),
    findOrderDetailByIdentifier: vi.fn(),
    findOrderForUserByIdentifier: vi.fn(),
    findOrderForCancellationById: vi.fn(),
    updateOrderPaymentStatus: vi.fn(),
    findOrdersByUserId: vi.fn(),
    countOrdersByUserId: vi.fn(),
    findExpiredPendingOrders: vi.fn(),
    cancelOrder: vi.fn(),
    cancelOrderAndRestoreStock: vi.fn(),
    findOrdersForAdmin: vi.fn(),
    countOrdersForAdmin: vi.fn(),
    findOrderForAdminByIdentifier: vi.fn(),
    updateOrderForAdmin: vi.fn(),
    findProductDetailsForOrder: vi.fn(),
  },
}));

vi.mock('@/services/order.service', () => ({
  getOrderPaymentExpiryDate: vi.fn(
    (createdAt: Date) => new Date(createdAt.getTime() + 30 * 60 * 1000),
  ),
  orderService: {
    getUserOrders: vi.fn(),
    getUserOrderDetail: vi.fn(),
    cancelUserOrder: vi.fn(),
    cancelOrderBySystemId: vi.fn(),
    getAdminOrders: vi.fn(),
    updateOrderForAdmin: vi.fn(),
  },
}));

vi.mock('@/repositories/paymentTransaction.repository', () => ({
  paymentTransactionRepository: {
    createPaymentTransaction: vi.fn(),
    updatePaymentStatus: vi.fn(),
    findTransactionByExternalId: vi.fn(),
  },
}));

vi.mock('@/repositories/product.repository', () => ({
  productRepository: {
    findChatProducts: vi.fn(),
    findProductById: vi.fn(),
    findAll: vi.fn(),
    countAll: vi.fn(),
    countByClothingType: vi.fn(),
    countByIsland: vi.fn(),
    countBySize: vi.fn(),
    countByGender: vi.fn(),
    countByStatus: vi.fn(),
    countLowStock: vi.fn(),
    countCreatedSince: vi.fn(),
    countOutOfStock: vi.fn(),
    findLowStock: vi.fn(),
    getPriceRange: vi.fn(),
    findByIdOrSlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/repositories/productVariant.repository', () => ({
  productVariantRepository: {
    findVariantById: vi.fn(),
    decrementVariantStock: vi.fn(),
    incrementVariantStock: vi.fn(),
  },
}));

vi.mock('@/services/product.service', () => ({
  productService: {
    getProducts: vi.fn(),
    getProductDetail: vi.fn(),
    getDashboardOverview: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

vi.mock('@/services/payment.service', () => ({
  paymentService: {
    checkout: vi.fn(),
    handleNotification: vi.fn(),
  },
}));

vi.mock('@/repositories/address.repository', () => ({
  addressRepository: {
    findAllByUser: vi.fn(),
    findById: vi.fn(),
    findDefaultByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    clearDefaultsByUser: vi.fn(),
    setDefault: vi.fn(),
    countByUser: vi.fn(),
  },
}));

vi.mock('@/services/address.service', () => ({
  addressService: {
    getAddresses: vi.fn(),
    createAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
    setDefaultAddress: vi.fn(),
  },
}));

vi.mock('@/lib/midtrans', () => ({
  createMidtransTransaction: vi.fn(),
  verifySignatureKey: vi.fn(),
}));

vi.mock('@/repositories/cart.repository', () => ({
  cartRepository: {
    findOrCreateByUser: vi.fn(),
    findByUserId: vi.fn(),
    addItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    removeItems: vi.fn(),
    removePurchasedItemsById: vi.fn(),
    removePurchasedItemsByProductVariant: vi.fn(),
    getCartItemCount: vi.fn(),
  },
}));

vi.mock('@/services/cart.service', () => ({
  cartService: {
    getCart: vi.fn(),
    addToCart: vi.fn(),
    updateCartItemQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    removeMultipleFromCart: vi.fn(),
    clearCart: vi.fn(),
    getCartCount: vi.fn(),
  },
}));

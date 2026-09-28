import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { ApiError } from '@/lib/error';
import { addressService } from '@/services/address.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, PUT } from '../../../src/app/api/addresses/[id]/route';

const mockService = vi.mocked(addressService);
const mockAuth = vi.mocked(AuthHelper);

const MOCK_ADDRESS = {
  id: 'addr-1',
  userId: 'user-1',
  label: 'Rumah',
  recipientName: 'Budi',
  phone: '081234567890',
  province: 'DKI Jakarta',
  city: 'Jakarta Pusat',
  district: 'Gambir',
  subdistrict: null,
  postalCode: '10110',
  fullAddress: 'Jl. Gambir No. 1',
  notes: null,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function createRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, options);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PUT /api/addresses/[id]', { tags: ['backend'] }, () => {
  it('should update address and return 200', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);
    mockService.updateAddress.mockResolvedValue({
      ...MOCK_ADDRESS,
      label: 'Kantor',
    } as never);

    const req = createRequest('http://localhost/api/addresses/addr-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Kantor' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'addr-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(mockService.updateAddress).toHaveBeenCalledWith(
      'addr-1',
      'user-1',
      expect.objectContaining({ label: 'Kantor' }),
    );
  });

  it('should return 404 if address not found (via service)', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);
    mockService.updateAddress.mockRejectedValue(
      new ApiError('Alamat tidak ditemukan', 404),
    );

    const req = createRequest('http://localhost/api/addresses/invalid', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Kantor' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'invalid' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.status).toBe('fail');
  });
});

describe('DELETE /api/addresses/[id]', { tags: ['backend'] }, () => {
  it('should delete address and return 200', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);
    mockService.deleteAddress.mockResolvedValue(MOCK_ADDRESS as never);

    const req = createRequest('http://localhost/api/addresses/addr-1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'addr-1' }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(mockService.deleteAddress).toHaveBeenCalledWith('addr-1', 'user-1');
  });

  it('should return 400 when trying to delete default address (via service)', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);
    mockService.deleteAddress.mockRejectedValue(
      new ApiError('Alamat utama tidak dapat dihapus', 400),
    );

    const req = createRequest('http://localhost/api/addresses/addr-1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'addr-1' }),
    });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe('fail');
    expect(body.data.message).toBe('Alamat utama tidak dapat dihapus');
  });
});

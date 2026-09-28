'use client';

import { Field, inputClassName } from '@/components/form-sections';
import {
  ProfileSection,
  profileCardClassName,
  profileOutlineButtonClassName,
  profilePrimaryButtonClassName,
} from '@/components/profile/profile-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import {
  Cake,
  Check,
  Edit2,
  Loader2,
  type LucideIcon,
  Mail,
  Phone,
  Save,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function InfoTile({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  const isEmpty = !value || value === '-';
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl bg-[#faf7f2] p-3.5 ring-1 ring-[#efe8dd] transition-colors hover:bg-[#f5ead3]/50',
        className,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5ead3] text-[#a07a2c] transition-colors group-hover:bg-[#2f5f49] group-hover:text-[#e8cb8d]">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wider text-[#9a8f80] uppercase">
          {label}
        </p>
        <p
          className={cn(
            'truncate text-sm font-semibold',
            isEmpty ? 'text-[#b3aa9e] italic' : 'text-[#2f3a33]',
          )}
        >
          {isEmpty ? 'Belum diisi' : value}
        </p>
      </div>
    </div>
  );
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string | Date;
}

export default function ProfileInfoSection() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as ExtendedUser | undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    gender: '',
    birthDate: '',
  });

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split('T')[0]
          : '', // Get YYYY-MM-DD
      });
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await authClient.updateUser({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        birthDate: formData.birthDate
          ? new Date(formData.birthDate)
          : undefined,
      });

      if (result.error) {
        toast.error(result.error.message || 'Gagal memperbarui profil');
      } else {
        toast.success('Profil berhasil diperbarui');
        setIsEditing(false);
      }
    } catch {
      toast.error('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedBirthDate = user?.birthDate
    ? new Date(user.birthDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  const formattedGender =
    user?.gender === 'male'
      ? 'Laki-laki'
      : user?.gender === 'female'
        ? 'Perempuan'
        : '-';

  const filledCount = [
    user?.name,
    user?.phoneNumber,
    user?.gender,
    user?.birthDate,
  ].filter(Boolean).length;

  if (isPending) {
    return (
      <div className={cn(profileCardClassName, 'animate-pulse p-6')}>
        <div className="mb-6 h-10 w-56 rounded-xl bg-[#efe8dd]" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[68px] rounded-xl bg-[#f4efe5]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProfileSection
      icon={UserRound}
      title="Informasi Profil"
      description={
        isEditing
          ? 'Perbarui data diri Anda'
          : `${filledCount}/4 data diri sudah dilengkapi`
      }
      aside={
        !isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className={cn(
              profileOutlineButtonClassName,
              'h-9 w-full sm:w-auto',
            )}
          >
            <Edit2 className="size-3.5" />
            Edit Profil
          </Button>
        ) : (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className={cn(
                profileOutlineButtonClassName,
                'h-9 flex-1 sm:flex-none',
              )}
            >
              <X className="size-3.5" />
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                profilePrimaryButtonClassName,
                'h-9 flex-1 sm:flex-none',
              )}
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Simpan
            </Button>
          </div>
        )
      }
    >
      {!isEditing ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoTile
            icon={UserRound}
            label="Nama Lengkap"
            value={user?.name || '-'}
          />
          <InfoTile
            icon={Phone}
            label="Nomor Telepon"
            value={user?.phoneNumber || '-'}
          />
          <InfoTile icon={Mail} label="Email" value={user?.email || '-'} />
          <InfoTile
            icon={Users}
            label="Jenis Kelamin"
            value={formattedGender}
          />
          <InfoTile
            icon={Cake}
            label="Tanggal Lahir"
            value={formattedBirthDate}
            className="md:col-span-2"
          />
        </div>
      ) : (
        <div className="grid animate-in grid-cols-1 gap-4 duration-300 fade-in md:grid-cols-2">
          <Field label="Nama Lengkap" required>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={inputClassName}
            />
          </Field>
          <Field label="Nomor Telepon">
            <Input
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="08xxxxxxxxxx"
              className={inputClassName}
            />
          </Field>
          <Field label="Email" required hint="Email tidak dapat diubah.">
            <Input
              value={user?.email || ''}
              readOnly
              className={cn(
                inputClassName,
                'pointer-events-none bg-[#f4efe5] text-[#6f6a62]',
              )}
            />
          </Field>
          <Field label="Jenis Kelamin">
            <div
              role="radiogroup"
              aria-label="Jenis kelamin"
              className="flex gap-2"
            >
              {GENDER_OPTIONS.map((option) => {
                const isActive = formData.gender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        gender: isActive ? '' : option.value,
                      })
                    }
                    className={cn(
                      'inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-sm transition-all',
                      isActive
                        ? 'bg-[#2f5f49] font-medium text-white shadow-[0_6px_14px_-6px_rgba(47,95,73,0.6)]'
                        : 'bg-white text-[#6f6a62] ring-1 ring-[#e5ded5] hover:text-[#2f5543] hover:ring-[#2f5f49]/40',
                    )}
                  >
                    {isActive ? <Check className="size-3.5" /> : null}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Tanggal Lahir">
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className={inputClassName}
            />
          </Field>
        </div>
      )}
    </ProfileSection>
  );
}

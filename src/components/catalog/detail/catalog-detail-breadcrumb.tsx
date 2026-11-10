import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type CatalogDetailBreadcrumbProps = {
  category: string;
  name: string;
};

export function CatalogDetailBreadcrumb({
  category,
  name,
}: CatalogDetailBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-ink-soft text-[13px] font-medium">
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="hover:text-ink">
            Beranda
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/catalog" className="hover:text-ink">
            Katalog
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-ink">{category}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-[280px] truncate text-ink">
            {name}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

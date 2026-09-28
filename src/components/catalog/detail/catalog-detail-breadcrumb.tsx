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
      <BreadcrumbList className="text-[#66786d] text-xs font-medium">
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="hover:text-[#2f5b49]">
            Beranda
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/catalog" className="hover:text-[#2f5b49]">
            Katalog
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-[#2f5b49]">{category}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-[280px] truncate text-[#2f5b49]">
            {name}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

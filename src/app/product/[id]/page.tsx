import ProductDetail from './ProductDetail';

export async function generateStaticParams() {
  return [
    { id: 'prod-001' },
    { id: 'prod-002' },
    { id: 'prod-003' },
    { id: 'prod-004' },
    { id: 'prod-005' },
    { id: 'prod-006' },
    { id: 'prod-007' },
    { id: 'prod-008' },
    { id: 'prod-009' },
    { id: 'prod-010' },
    { id: 'prod-011' },
    { id: 'prod-012' },
  ];
}

export default function ProductPage() {
  return <ProductDetail />;
}

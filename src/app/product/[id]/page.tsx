import ProductDetail from './ProductDetail';

export async function generateStaticParams() {
  return [
    { id: 'prod_1' },
    { id: 'prod_2' },
    { id: 'prod_3' },
    { id: 'prod_4' },
    { id: 'prod_5' },
    { id: 'prod_6' },
  ];
}

export default function ProductPage() {
  return <ProductDetail />;
}

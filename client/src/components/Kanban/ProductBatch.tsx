import { useParams } from 'react-router-dom';

const ProductBatch = () => {
  const { productBatchId } = useParams();

  return <div>AAA {productBatchId}</div>;
};

export default ProductBatch;

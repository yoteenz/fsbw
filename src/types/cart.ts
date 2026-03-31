export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type?: string;
  balance?: number;
  capSize?: string;
  capSizePrice?: number;
  length?: string;
  density?: string;
  color?: string;
  texture?: string;
  lace?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
  /** BCF bundles PDP: 3× line with $40 off combined (see texture-category-product). */
  bcfBundleDeal?: boolean;
  /** Pre-discount line subtotal (3× list unit price) for strikethrough at checkout/bag. */
  bcfBundleDealListSubtotal?: number;
}






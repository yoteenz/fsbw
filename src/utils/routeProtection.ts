/**
 * Route Package Protection API Integration
 * 
 * This file handles Route's Protect v2 API integration for package protection.
 * Uses REST API to preserve custom checkout UI design.
 * 
 * TODO: Add Route API credentials to environment variables:
 * - REACT_APP_ROUTE_PUBLIC_KEY (for frontend - can be public)
 * - REACT_APP_ROUTE_SECRET_KEY (for backend API calls - keep server-side only!)
 * 
 * Documentation: https://docs.route.com/docs/protect-v2/
 */

export interface RouteProtectionData {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  protectionFee: number;
}

export interface RouteProtectionResult {
  success: boolean;
  protectionId?: string;
  error?: string;
}

/**
 * Create Route package protection for an order
 * 
 * NOTE: This should ideally be called from your backend server to keep the secret key secure.
 * For now, this is a frontend implementation that requires the public key.
 * 
 * @param protectionData - Order and customer information for Route protection
 * @returns Route protection result with protection ID or error
 */
export const createRouteProtection = async (
  protectionData: RouteProtectionData
): Promise<RouteProtectionResult> => {
  try {
    // Get Route API key from environment variables
    const routePublicKey = process.env.REACT_APP_ROUTE_PUBLIC_KEY;
    
    if (!routePublicKey) {
      console.warn('Route API key not configured. Package protection will not be registered with Route.');
      // Return success to not block checkout, but log warning
      return {
        success: true,
        error: 'Route API key not configured'
      };
    }

    // Route Protect v2 API endpoint
    // NOTE: In production, this should be called from your backend server
    // The secret key should NEVER be exposed in frontend code
    const routeApiUrl = process.env.REACT_APP_ROUTE_API_URL || 'https://api.route.com/v2/protect';

    // Prepare request payload according to Route's API specification
    const requestPayload = {
      order: {
        id: protectionData.orderId,
        number: protectionData.orderNumber,
        total: protectionData.orderTotal,
        currency: protectionData.currency,
        items: protectionData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku || item.name
        }))
      },
      customer: {
        email: protectionData.customer.email,
        firstName: protectionData.customer.firstName,
        lastName: protectionData.customer.lastName,
        phone: protectionData.customer.phoneNumber || ''
      },
      shipping: {
        address: protectionData.shipping.address,
        city: protectionData.shipping.city,
        state: protectionData.shipping.state,
        zip: protectionData.shipping.zip,
        country: protectionData.shipping.country
      },
      protection: {
        fee: protectionData.protectionFee,
        currency: protectionData.currency
      }
    };

    // Make API call to Route
    const response = await fetch(routeApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${routePublicKey}`,
        // Route may require additional headers - check their documentation
        'X-Route-Version': '2.0'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Route API error:', response.status, errorData);
      
      // Don't block checkout if Route API fails - log error but continue
      return {
        success: false,
        error: `Route API error: ${response.status} ${response.statusText}`
      };
    }

    const responseData = await response.json();
    
    // Extract protection ID from Route's response
    // Response format may vary - adjust based on Route's actual API response
    const protectionId = responseData.protectionId || responseData.id || responseData.data?.protectionId;

    return {
      success: true,
      protectionId: protectionId
    };

  } catch (error) {
    console.error('Error creating Route protection:', error);
    
    // Don't block checkout if Route API fails - log error but continue
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating Route protection'
    };
  }
};

/**
 * Helper function to prepare Route protection data from checkout form
 */
export const prepareRouteProtectionData = (
  orderId: string,
  orderNumber: string,
  orderTotal: number,
  currency: string,
  cartItems: any[],
  customerEmail: string,
  customerFirstName: string,
  customerLastName: string,
  customerPhone: string,
  shippingAddress: string,
  shippingCity: string,
  shippingState: string,
  shippingZip: string,
  shippingCountry: string,
  protectionFee: number
): RouteProtectionData => {
  return {
    orderId,
    orderNumber,
    orderTotal,
    currency,
    items: cartItems.map(item => ({
      name: item.name || 'Product',
      quantity: item.quantity || 1,
      price: item.price || 0,
      sku: item.id || item.name
    })),
    customer: {
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
      phoneNumber: customerPhone
    },
    shipping: {
      address: shippingAddress,
      city: shippingCity,
      state: shippingState,
      zip: shippingZip,
      country: shippingCountry
    },
    protectionFee
  };
};

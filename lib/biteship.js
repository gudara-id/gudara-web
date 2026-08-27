const BITESHIP_BASE_URL = "https://api.biteship.com/v1";
const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;

async function biteshipFetch(path, options = {}) {
  const res = await fetch(`${BITESHIP_BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      authorization: BITESHIP_API_KEY,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Biteship error (${res.status})`);
  }
  return data;
}

// Origin toko — sesuaikan dengan gudang Gudara
export const SHOP_ORIGIN = {
  contact_name: process.env.SHOP_CONTACT_NAME || "Gudara Sportswear",
  contact_phone: process.env.SHOP_CONTACT_PHONE,
  address: process.env.SHOP_ADDRESS,
  postal_code: Number(process.env.SHOP_POSTAL_CODE),
};

export async function getShippingRates({
  destinationPostalCode,
  couriers = "jne,sicepat,anteraja,jnt",
  items, // [{ name, value, weight, quantity }]
}) {
  return biteshipFetch("/rates/couriers", {
    method: "POST",
    body: JSON.stringify({
      origin_postal_code: SHOP_ORIGIN.postal_code,
      destination_postal_code: Number(destinationPostalCode),
      couriers,
      items,
    }),
  });
}

export async function createShippingOrder({
  destination,
  courierCompany,
  courierType,
  items,
  referenceId, // pakai order id kamu sendiri, harus unique
}) {
  return biteshipFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      shipper_contact_name: SHOP_ORIGIN.contact_name,
      shipper_contact_phone: SHOP_ORIGIN.contact_phone,
      origin_contact_name: SHOP_ORIGIN.contact_name,
      origin_contact_phone: SHOP_ORIGIN.contact_phone,
      origin_address: SHOP_ORIGIN.address,
      origin_postal_code: SHOP_ORIGIN.postal_code,
      destination_contact_name: destination.contact_name,
      destination_contact_phone: destination.contact_phone,
      destination_address: destination.address,
      destination_postal_code: Number(destination.postal_code),
      courier_company: courierCompany,
      courier_type: courierType,
      delivery_type: "now",
      reference_id: referenceId,
      items,
    }),
  });
}
import Stripe from "stripe"

export default async function handler(req, res)
{
  if (req.method.toLocaleLowerCase() !== "get" ) {
    return res.status(405).end()
  }
  const stripe = new Stripe(process.env.STRIPE_API_KEY,{
    apiVersion: "2020-08-27",
    maxNetworkRetries: 3
  })

  const products = await stripe.products.list()
  if (!products.data || products.data.length < 1) {
    return res.status(200).json([])
  }
  
  const response = await Promise.all(products.data.map(async (product, i) => {
    const prices = await stripe.prices.list({
      product: product.id
    })
    return {
      id: product.id,
      description: product.description,
      name: product.name,
      images: product.images,
      unit_label: product.unit_label,
      prices: prices.data.map(price => {
        return {
          id: price.id,
          currency: price.currency,
          trasform_quantity: price.trasform_quantity,
          unit_amount: price.unit_amount,
        }
      })
    }
  }))

  res.status(200).json(response)
}

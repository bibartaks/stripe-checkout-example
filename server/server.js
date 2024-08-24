require("dotenv").config()

const express = require("express")
const app = express()
const cors = require("cors")
app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:5500",
  })
)

const stripe = require("stripe")(process.env.STRIPE_API_KEY)

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Learn Next.js Today" }],
  [2, { priceInCents: 20000, name: "Learn CSS Today" }],
  [3, { priceInCents: 30000, name: "Learn C212SS Today" }],
])

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url: `http://localhost:5500/client/success.html`,
      cancel_url: `http://localhost:5500/cancel.html`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000)

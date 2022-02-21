import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";

type User = {
  ref: {
    id: string;
  };
  data: {
    stipe_custumer_id;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const session = await getSession({ req });

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
    );

    let custumerId = user.data.stipe_custumer_id;

    if (!custumerId) {
      const stipeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      await fauna.query(
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: {
            stipe_custumer_id: stipeCustomer.id,
          },
        })
      );

      custumerId = stipeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: custumerId, // necessario cadastrar o usuario no stripe para pegar o id dele e referenciar a compra ao id
      payment_method_types: ["card"], // method de pagamento card(cartão)
      billing_address_collection: "required", // obrigar o usuario a preencher o endereço...
      line_items: [
        // quais os items do carrinho da pessoa
        { price: "price_1Js9GvEE1bGb2DEzbaQSxrNk", quantity: 1 }, // price = id do price
      ],
      mode: "subscription", // subscription = pagamento recorrente ( nao e um pagamento apenas )
      allow_promotion_codes: true, // as vezes e possivel criar um cupom para promoções
      success_url: process.env.STRIPE_SUCCESS_URL, // Quando der sucesso, para onde o usuario deve ser redirecioado
      cancel_url: process.env.STRIPE_CANCEL_URL, // Se cancelar a compra, pra onde ele vai ser redirecionado
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
}

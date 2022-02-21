import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { query as q } from 'faunadb'

import { fauna } from '../../../services/fauna'

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user' // usado para pegar informacoes do usuario, pode ir na documentacao que acha mais opcoes
    }),
  ],
  callbacks: {
    async session(session){
      try{
        const userActiveSubscription = await fauna.query(
          // estamos procurando uma subscription, apartir de uma ref, que estamos pegando apartir do email do usuario
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        ) 
  
        return {
          ...session,
          activeSubscription: userActiveSubscription,
        }
      }catch{
        return{
          ...session,
          activeSubscription: null
        }
      }
    },

    async signIn(user, account, profile) {
      const { email } = user
      
      try{
        await fauna.query(
          q.If( // se
            q.Not( // Nao
              q.Exists( // existir
                q.Match(  // where
                  q.Index('user_by_email'), // com o index(criado no fauna) email
                  q.Casefold(email) // com esse email
                )
              )
            ),
            q.Create( // voce cria
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get( // caso contrario, voce pega os dados
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(email)
              )
            )
          )
        )

        return true
      }catch(e){
        console.log(e)
        return false
      }

      return true
    },
  }
})
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { SubscribeButton } from '../components/SubcribeButton';
import { stripe } from '../services/stripe';
import styled from './home.module.scss';

interface HomeProps {
	product: {
		priceId: string;
		amount: string;
	};
}

export default function Home({ product }: HomeProps) {
	return (
		<>
			<Head>
				<title>Home | ig.news</title>
			</Head>
			<main className={styled.contentContainer}>
				<section className={styled.hero}>
					<span>👏 Hey, welcome</span>
					<h1>
						News about the <span>React</span> world.
					</h1>
					<p>
						Get acess to all the publications <br />
						<span>for {product.amount} month</span>
					</p>
					<SubscribeButton />
				</section>

				<img src="/images/avatar.svg" alt="Girl coding" />
			</main>
		</>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const price = await stripe.prices.retrieve('price_1Js9GvEE1bGb2DEzbaQSxrNk');

	const product = {
		priceId: price.id,
		amount: new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(price.unit_amount / 100),
	};
	return {
		props: {
			product,
		},
		revalidate: 60 * 60 * 24, // 24hrs
	};
};

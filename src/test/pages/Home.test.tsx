import { screen, render } from '@testing-library/react';
import Home, { getStaticProps } from '../../pages';
import { stripe } from '../../services/stripe';
import { GetStaticProps } from 'next';

jest.mock('next/router');
jest.mock('next-auth/client', () => {
	return {
		useSession: () => [null, false],
	};
});
jest.mock('../../services/stripe');

describe('Home Page', () => {
	it('should render correctly', () => {
		render(<Home product={{ priceId: 'fake-price-id', amount: 'R$10,00' }} />);

		expect(screen.getByText('for R$10,00 month')).toBeInTheDocument();
	});
	it('should load inital data', async () => {
		const stripeMockedPricesRetrieve = jest.mocked(stripe.prices.retrieve);

		stripeMockedPricesRetrieve.mockResolvedValueOnce({
			///aqui estamos mockando a funcao strapi para chamar o getstaticprops
			id: 'fake-price-id',
			unit_amount: 1000,
		} as any);

		const response = await getStaticProps({}); // chamando o getstaticprops e ele esta usando o mocked

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					product: {
						priceId: 'fake-price-id',
						amount: '$10.00',
					},
				},
			}),
		);
	});
});

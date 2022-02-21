import { screen, render } from '@testing-library/react';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { stripe } from '../../services/stripe';
import { getPrismicClient } from '../../services/prismic';
import { getSession } from 'next-auth/client';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

const post = {
	slug: 'slug-test',
	title: 'title-test',
	content: '<p>expect-test</p>',
	updatedAt: '10 de abril',
};

describe('Post Page', () => {
	it('should render correctly', () => {
		render(<Post post={post} />);

		expect(screen.getByText('title-test')).toBeInTheDocument();
		expect(screen.getByText('expect-test')).toBeInTheDocument();
	});

	it('should redirect user if no subscription is found', async () => {
		const getSessionMocked = jest.mocked(getSession);

		getSessionMocked.mockResolvedValueOnce(null);

		const response = await getServerSideProps({
			params: { slug: 'my new post' },
		} as any); // chamando o getstaticprops e ele esta usando o mocked

		expect(response).toEqual(
			expect.objectContaining({
				redirect: {
					destination: '/',
					permanent: false,
				},
			}),
		);
	});

	it('should loads data initial', async () => {
		const getSessionMocked = jest.mocked(getSession);

		getSessionMocked.mockResolvedValueOnce({
			activeSubscription: 'active',
		} as any);

		const getPrismicClientMocked = jest.mocked(getPrismicClient);
		getPrismicClientMocked.mockReturnValueOnce({
			getByUID: jest.fn().mockResolvedValueOnce({
				data: {
					title: [{ type: 'heading', text: 'my new header' }],
					content: [{ type: 'paragraph', text: 'my new body' }],
				},
				last_publication_date: '01-02-2001',
			}),
		} as any);

		const response = await getServerSideProps({
			params: { slug: 'my new post' },
		} as any);

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					post: {
						slug: 'my new post',
						title: 'my new header',
						content: '<p>my new body</p>',
						updatedAt: '02 de janeiro de 2001',
					},
				},
			}),
		);
	});
});

import { screen, render } from '@testing-library/react';
import Posts, { getStaticProps } from '../../pages/posts';
import { stripe } from '../../services/stripe';
import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic');
jest.mock('next-auth/client', () => {
	return {
		useSession: () => [null, false],
	};
});

const posts = [
	{
		slug: 'slug-test',
		title: 'title-test',
		excerpt: 'expect-test',
		updatedAt: '10 de abril',
	},
];

describe('Posts Page', () => {
	it('should render correctly', () => {
		render(<Posts posts={posts} />);

		expect(screen.getByText('title-test')).toBeInTheDocument();
	});

	it('should load inital data', async () => {
		const getPrismicClientMocked = jest.mocked(getPrismicClient);

		getPrismicClientMocked.mockReturnValueOnce({
			query: jest.fn().mockResolvedValueOnce({
				results: [
					{
						uid: 'my-new-post',
						data: {
							title: [{ type: 'heading', text: 'my new post' }],
							content: [{ type: 'paragraph', text: 'my new post' }],
						},
						last_publication_date: '04-01-2002',
					},
				],
			}),
		} as any);

		const response = await getStaticProps({ params: { slug: 'my-new-post' } }); // chamando o getstaticprops e ele esta usando o mocked

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					posts: [
						{
							slug: 'my-new-post',
							title: 'my new post',
							excerpt: 'my new post',
							updatedAt: '01 de abril de 2002',
						},
					],
				},
			}),
		);
	});
});

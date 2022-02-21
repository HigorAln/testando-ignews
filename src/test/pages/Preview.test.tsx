import { screen, render } from '@testing-library/react';
import Preview, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');
jest.mock('next/router');

const post = {
	slug: 'slug-test',
	title: 'title-test',
	content: 'expect-test',
	updatedAt: '10 de abril',
};

describe('Posts Preview Page', () => {
	it('should render correctly', () => {
		const useSessionMocked = jest.mocked(useSession);
		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<Preview post={post} />);

		expect(screen.getByText('title-test')).toBeInTheDocument();
		expect(screen.getByText('expect-test')).toBeInTheDocument();
		expect(screen.getByText('Wanna Continue Reading?')).toBeInTheDocument();
	});

	it('should redirect users to full post when is subscribed', async () => {
		const useSessionMocked = jest.mocked(useSession);
		useSessionMocked.mockReturnValueOnce([
			{ activeSubscription: 'fake-subscription' },
			false,
		]);
		const useRouterMocked = jest.mocked(useRouter);
		const pushMock = jest.fn();
		useRouterMocked.mockReturnValueOnce({
			push: pushMock,
		} as any);

		render(<Preview post={post} />);

		expect(pushMock).toBeCalledWith('/posts/slug-test');
	});
	it('should loads inital data', async () => {
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

		const response = await getStaticProps({
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

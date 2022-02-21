import { screen, render, fireEvent } from '@testing-library/react';
import { SubscribeButton } from './index';
import { signIn, useSession } from 'next-auth/client';
import { mocked } from 'ts-jest/utils';
import { useRouter } from 'next/router';

jest.mock('next-auth/client');
jest.mock('next/router');

describe('SubscribeButton Components', () => {
	it('should render a text on s creen', () => {
		const useSessionMocked = jest.mocked(useSession);

		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<SubscribeButton />);

		expect(screen.getByText('Subscribe now')).toBeInTheDocument();
	});

	it('should redirects user to sign in when not authenticated', () => {
		const useSessionMocked = jest.mocked(useSession);
		useSessionMocked.mockReturnValueOnce([null, false]);

		const signInMocket = jest.mocked(signIn);

		render(<SubscribeButton />);

		const subscribe = screen.getByText('Subscribe now');

		fireEvent.click(subscribe);

		expect(signInMocket).toHaveBeenCalled();
	});

	it('should be redirects to posts when user already has a subscription', () => {
		const useRouterMocked = jest.mocked(useRouter);
		const pushMock = jest.fn();
		useRouterMocked.mockReturnValueOnce({
			push: pushMock,
		} as any);

		const useSessionMocked = jest.mocked(useSession);

		useSessionMocked.mockReturnValueOnce([
			{
				user: { name: 'John Doe', email: 'example@gmail.com' },
				activeSubscription: 'fake-active',
				expires: 'fake-example',
			},
			false,
		]);

		render(<SubscribeButton />);

		const subscribe = screen.getByText('Subscribe now');

		fireEvent.click(subscribe);

		expect(pushMock).toHaveBeenCalledWith('/posts');
	});
});

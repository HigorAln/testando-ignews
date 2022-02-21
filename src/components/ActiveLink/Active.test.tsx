import { render, screen } from '@testing-library/react';
import { ActiveLink } from '.';

jest.mock('next/router', () => {
	return {
		useRouter() {
			return {
				asPath: '/',
			};
		},
	};
});

describe('ActiveLink components', () => {
	it('should active link renders correcly', () => {
		render(
			<ActiveLink href="/" activeClassName="active">
				<a>Home</a>
			</ActiveLink>,
		);

		expect(screen.getByText('Home')).toBeInTheDocument();
	});

	it('should active link is receiving active class', () => {
		render(
			<ActiveLink href="/" activeClassName="active">
				<a>Home</a>
			</ActiveLink>,
		);

		expect(screen.getByText('Home')).toHaveClass('active');
	});
});

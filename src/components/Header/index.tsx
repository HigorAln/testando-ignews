import { SignInButton } from '../SignInButton';
import styled from './styles.module.scss';
import { ActiveLink } from '../ActiveLink';

export function Header() {
	return (
		<header className={styled.headerContainer}>
			<div className={styled.headerContent}>
				<img src="/images/logo.svg" alt="ig.news" />
				<nav>
					<ActiveLink activeClassName={styled.active} href="/">
						<a>Home</a>
					</ActiveLink>
					<ActiveLink activeClassName={styled.active} href="/posts">
						<a>Posts</a>
					</ActiveLink>
				</nav>
				<SignInButton />
			</div>
		</header>
	);
}

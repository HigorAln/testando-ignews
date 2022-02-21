import { GetStaticPaths, GetStaticProps } from 'next';
import { useSession } from 'next-auth/client';
import styled from '../post.module.scss';
import { RichText } from 'prismic-dom';
import Link from 'next/link';

import { getPrismicClient } from '../../../services/prismic';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface PostPreviewProps {
	post: {
		slug: string;
		title: string;
		content: string;
		updatedAt: string;
	};
}

export default function PostPreview({ post }: PostPreviewProps) {
	const [session] = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session?.activeSubscription) {
			router.push(`/posts/${post.slug}`);
		}
	}, [session]);
	return (
		<>
			<main className={styled.container}>
				<article className={styled.post}>
					<h1>{post.title}</h1>
					<time>{post.updatedAt}</time>
					<div
						dangerouslySetInnerHTML={{ __html: post.content }}
						className={`${styled.postContent} ${styled.previewContent}`}
					/>
					<div className={styled.continueReading}>
						Wanna Continue Reading?
						<button>Subscribe Now 🤗</button>
					</div>
				</article>
			</main>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = () => {
	return {
		paths: [],
		fallback: 'blocking',
		// true = se alguem tentar acessa um post que ano foi gerado de forma estatic (isFallBack)
		// false = caso o site ainda nao tenha sido gerado de forma estatica ele retorna um 404 para o usuario para
		// blocking = ele e igual o `true` porem ele faz o Server side Redering, ele cria a pagina estatica e manda para o client
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { slug } = params;

	const prismic = getPrismicClient();

	const response = await prismic.getByUID('publication', String(slug), {});

	const post = {
		slug,
		title: RichText.asText(response.data.title),
		content: RichText.asHtml(response.data.content.splice(0, 3)),
		updatedAt: new Date(response.last_publication_date).toLocaleDateString(
			'pt-BR',
			{
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			},
		),
	};

	return {
		props: {
			post,
		},
		revalidate: 60 * 30, // 30 minutos
	};
};

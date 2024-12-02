import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';

const noLayoutPages = ['/auth/signin']; // Add any pages that shouldn't use the layout

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps }
}: AppProps) {
  const router = useRouter();
  const shouldUseLayout = !noLayoutPages.includes(router.pathname);

  return (
    <SessionProvider session={session}>
      {shouldUseLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}

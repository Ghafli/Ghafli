import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { CircularProgress, Box } from '@mui/material';

const SignUpForm = dynamic(
  () => import('../../components/auth/SignUpForm'),
  { 
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    ),
    ssr: false
  }
);

export default function SignUp() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <SignUpForm />
    </Suspense>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

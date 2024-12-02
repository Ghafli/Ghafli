import SignInForm from '../../components/auth/SignInForm';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';

export default function SignIn() {
  return <SignInForm />;
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

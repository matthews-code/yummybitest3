import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../server/auth";
import Image from "next/image";

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      {Object.values(providers).map((provider) => (
        <div
          className="flex h-screen flex-col items-center justify-center"
          key={provider.name}
        >
          <div className="flex w-72 flex-col gap-8">
            <h1 className="text-center text-3xl font-bold">Yummy Bites!</h1>
            <button
              className="relative z-10 inline h-fit rounded-lg border-2 border-solid border-blue-500 bg-blue-500 p-2 text-xs font-semibold text-white"
              onClick={() => signIn(provider.id)}
            >
              <Image
                className="absolute bottom-0 left-0 rounded-md"
                src={"/google.jpg"}
                height={0}
                width={32}
                alt={"Google logo"}
                unoptimized={true}
              />
              Sign in with {provider.name}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}

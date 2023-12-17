// import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Header from "~/components/Header";
import Order from "~/components/Order";
import Users from "~/components/Users";
import Items from "~/components/Items";

import { useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { useState } from "react";
import { GetServerSideProps } from "next";
import { withAuth } from "~/utils/auth";

export const getServerSideProps: GetServerSideProps = withAuth(async () => {
  // Your usual getServerSideProps logic

  return {
    props: {
      // Your props here
    },
  };
});

export default function Home() {
  const { data: sessionData } = useSession();
  // const hello = api.post.hello.useQuery({ text: "from tRPC" });

  const [page, setPage] = useState<string>("orders");

  return (
    <>
      <Head>
        <title>Yummy Bites</title>
        <meta
          name="yummy bites order tracking web app"
          content="Generated by create-t3-app"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {sessionData && <Header setPage={setPage}></Header>}
        {sessionData && page === "orders" && <Order></Order>}
        {sessionData && page === "users" && <Users></Users>}
        {sessionData && page === "items" && <Items></Items>}
      </main>
    </>
  );
}

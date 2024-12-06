import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Flashcard App</title>
        <meta name="description" content="A simple flashcard application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Flashcard App</h1>
        <p>Start learning with flashcards!</p>
      </main>
    </div>
  )
}

export default Home

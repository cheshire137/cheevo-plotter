import React from 'react'
import { backendUrl } from '../models/SteamApi'
import { PageLayout, Link } from '@primer/react'

const SteamAuthPage = () => {
  return <PageLayout>
    <PageLayout.Header>
      <h1>Cheevo Plotter</h1>
    </PageLayout.Header>
    <PageLayout.Content>
      <Link href={`${backendUrl}/auth/steam`}>Sign in with Steam</Link>
    </PageLayout.Content>
  </PageLayout>
}

export default SteamAuthPage

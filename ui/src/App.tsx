import type {PropsWithChildren} from 'react'
import {BaseStyles, Button, Heading, Link, PageLayout, ThemeProvider, Tooltip, Spinner} from '@primer/react'
import {useGetCurrentUser} from './queries/use-get-current-user'
import {useGetGames} from './queries/use-get-games'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/primitives.css'
import './App.css'

function App() {
  const {data: currentUser, isPending: isCurrentUserPending} = useGetCurrentUser()
  const {data: ownedGames, isPending: isOwnedGamesPending} = useGetGames({steamId: currentUser?.steamId})

  return (
    <ProviderStack>
      <PageLayout>
        <PageLayout.Header>
          <Heading as="h1">Cheevo plotter</Heading>
          {currentUser ? (
            <form method="POST" action={`${import.meta.env.VITE_BACKEND_URL}/user/logout`}>
              <Tooltip text={`Signed in as ${currentUser.name}`}>
                <Button variant="invisible" type="submit">
                  Sign out
                </Button>
              </Tooltip>
            </form>
          ) : (
            <Link href={`${import.meta.env.VITE_BACKEND_URL}/auth/steam`}>Sign in with Steam</Link>
          )}
        </PageLayout.Header>
        <PageLayout.Content>
          {(isCurrentUserPending || isOwnedGamesPending) && <Spinner />}
          {ownedGames && (
            <>
              {currentUser && <Heading as="h2">{currentUser.name}&rsquo;s owned games</Heading>}
              <ul>
                {ownedGames.map(game => (
                  <li key={game.appId}>
                    {game.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </PageLayout.Content>
      </PageLayout>
    </ProviderStack>
  )
}

function ProviderStack({children}: PropsWithChildren) {
  return (
    <ThemeProvider>
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>
  )
}

export default App

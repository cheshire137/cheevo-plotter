import {type PropsWithChildren, useState} from 'react'
import {
  ActionList,
  BaseStyles,
  Button,
  Heading,
  Link,
  PageLayout,
  ThemeProvider,
  Tooltip,
  Spinner,
} from '@primer/react'
import {useGetCurrentUser} from './queries/use-get-current-user'
import {useGetGames} from './queries/use-get-games'
import type {SteamGame} from './types'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/primitives.css'
import './App.css'

function App() {
  const {data: currentUser, isPending: isCurrentUserPending} = useGetCurrentUser()
  const {data: ownedGames, isPending: isOwnedGamesPending} = useGetGames({steamId: currentUser?.steamId})
  const [selectedGame, setSelectedGame] = useState<SteamGame | null>(null)

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
              <ActionList selectionVariant="single" role="menu" aria-label="Owned game">
                {ownedGames.map(game => {
                  const isSelected = game.appId === selectedGame?.appId
                  return (
                    <ActionList.Item
                      selected={isSelected}
                      aria-checked={isSelected}
                      onSelect={() => setSelectedGame(game)}
                      key={game.appId}
                      role="menuitemradio"
                    >
                      {game.name}
                    </ActionList.Item>
                  )
                })}
              </ActionList>
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

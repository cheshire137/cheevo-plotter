import {type PropsWithChildren, useCallback, useState} from 'react'
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
  Stack,
} from '@primer/react'
import {useSearchParams} from 'react-router-dom'
import {LockIcon, UnlockIcon} from '@primer/octicons-react'
import {useGetCurrentUser} from './queries/use-get-current-user'
import {useGetGames} from './queries/use-get-games'
import {useGetAchievements} from './queries/use-get-achievements'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/primitives.css'
import './App.css'

function App() {
  const {data: currentUser, isPending: isCurrentUserPending} = useGetCurrentUser()
  const {data: ownedGames, isPending: isOwnedGamesPending} = useGetGames()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedGameId, setSelectedGameId] = useState<string | null>(searchParams.get("appid"))
  const {data: achievementsResp, isPending: isAchievementsPending} = useGetAchievements({appId: selectedGameId})
  const selectGame = useCallback((appId: string) => {
    setSelectedGameId(appId)
    setSearchParams({appid: appId})
  }, [setSearchParams])

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
          <Stack direction="horizontal">
            {ownedGames && (
              <Stack.Item>
                {currentUser && <Heading as="h2">{currentUser.name}&rsquo;s owned games</Heading>}
                <ActionList selectionVariant="single" role="menu" aria-label="Owned game">
                  {ownedGames.map(game => {
                    const isSelected = game.appId === selectedGameId
                    return (
                      <ActionList.Item
                        selected={isSelected}
                        aria-checked={isSelected}
                        onSelect={() => selectGame(game.appId)}
                        key={game.appId}
                        role="menuitemradio"
                      >
                        {game.name}
                      </ActionList.Item>
                    )
                  })}
                </ActionList>
              </Stack.Item>
            )}
            {selectedGameId && (
              <Stack.Item>
                {isAchievementsPending ? (
                  <Spinner />
                ) : (
                  <ul>
                    {achievementsResp?.playerAchievements?.map(achievement => {
                      const unlockTime =
                        achievement.unlockTime.length > 0 ? new Date(achievement.unlockTime) : undefined
                      return (
                        <li key={achievement.id}>
                          {achievement.id}
                          {achievement.unlocked ? <UnlockIcon /> : <LockIcon />}
                          {unlockTime && <span>{unlockTime.toLocaleDateString()}</span>}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Stack.Item>
            )}
          </Stack>
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

import {type PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {Blankslate} from '@primer/react/experimental'
import {BaseStyles, CounterLabel, Heading, PageLayout, Spinner, ThemeProvider} from '@primer/react'
import {TrophyIcon} from '@primer/octicons-react'
import {useSearchParams} from 'react-router-dom'
import {useGetGames} from './queries/use-get-games'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/primitives.css'
import './App.css'
import {AchievementsList} from './components/AchievementsList'
import {OwnedGamesList} from './components/OwnedGamesList'
import {useGetFriends} from './queries/use-get-friends'
import {AppHeader} from './components/AppHeader'
import {FriendsList, friendSeparator, maxSelectedFriends} from './components/FriendsList'
import {SelectedFriendsList} from './components/SelectedFriendsList'

function App() {
  const {data: ownedGames, isPending: isOwnedGamesPending} = useGetGames()
  const [searchParams, setSearchParams] = useSearchParams()
  const {data: friends, isPending: isFriendsPending} = useGetFriends()
  const [selectedGameId, setSelectedGameId] = useState<string | null>(searchParams.get('appid'))
  const selectedFriendIds = useMemo<string[]>(() => {
    const friendParam = searchParams.get('friends')
    if (friendParam && friendParam.length > 0) {
      return friendParam
        .split(friendSeparator)
        .map(id => id.trim())
        .slice(0, maxSelectedFriends)
    }
    return []
  }, [searchParams])
  const selectedGame = useMemo(
    () => (ownedGames && selectedGameId ? ownedGames.find(g => g.appId === selectedGameId) : undefined),
    [ownedGames, selectedGameId]
  )
  const selectedFriends = useMemo(
    () => (friends ? friends.filter(f => selectedFriendIds.includes(f.steamId)) : []),
    [selectedFriendIds, friends]
  )
  const selectGame = useCallback(
    (appId: string) => {
      setSelectedGameId(appId)
      setSearchParams({appid: appId})
    },
    [setSearchParams]
  )

  return (
    <ProviderStack>
      <PageLayout>
        <PageLayout.Header>
          <AppHeader />
        </PageLayout.Header>
        <PageLayout.Pane aria-label="Owned games" position="start" sticky>
          {isOwnedGamesPending && <Spinner />}
          {ownedGames && (
            <>
              <Heading as="h2">
                Owned games <CounterLabel>{ownedGames.length.toLocaleString()}</CounterLabel>
              </Heading>
              <OwnedGamesList ownedGames={ownedGames} selectedGameId={selectedGameId} selectGame={selectGame} />
            </>
          )}
        </PageLayout.Pane>
        <PageLayout.Content>
          {selectedGame ? (
            <>
              {selectedFriendIds.length < 1 ? (
                <Blankslate border>
                  <Blankslate.Visual>
                    <TrophyIcon size="medium" />
                  </Blankslate.Visual>
                  <Blankslate.Heading>Select a friend to compare achievements</Blankslate.Heading>
                </Blankslate>
              ) : (
                <SelectedFriendsList appId={selectedGame.appId} friends={selectedFriends} />
              )}
              <AchievementsList game={selectedGame} />
            </>
          ) : (
            <Blankslate>
              <Blankslate.Visual>
                <TrophyIcon size="medium" />
              </Blankslate.Visual>
              <Blankslate.Heading>Select a game to see achievements</Blankslate.Heading>
            </Blankslate>
          )}
        </PageLayout.Content>
        {(isFriendsPending || friends) && selectedGame && (
          <PageLayout.Pane aria-label="Friends" position="end" divider="line">
            {isFriendsPending && <Spinner />}
            {friends && (
              <>
                <Heading as="h2">
                  Friends
                  <span className="selected-friends-count">
                    {selectedFriendIds.length} of {friends.length} selected
                  </span>
                </Heading>
                <FriendsList selectedFriendIds={selectedFriendIds} friends={friends} />
              </>
            )}
          </PageLayout.Pane>
        )}
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

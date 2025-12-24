import type {PropsWithChildren} from 'react'
import {BaseStyles, CounterLabel, Heading, PageLayout, Spinner, ThemeProvider} from '@primer/react'
import {useGetGames} from './queries/use-get-games'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/primitives.css'
import './App.css'
import {OwnedGamesList} from './components/OwnedGamesList'
import {AppHeader} from './components/AppHeader'
import {SelectedFriendsProvider} from './contexts/SelectedFriendsProvider'
import {SelectedGameDisplay} from './components/SelectedGameDisplay'
import {SelectedGameProvider} from './contexts/SelectedGameProvider'
import { FriendsPane } from './components/FriendsPane'

function App() {
  const {data: ownedGames, isPending: isOwnedGamesPending} = useGetGames()

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
              <OwnedGamesList ownedGames={ownedGames} />
            </>
          )}
        </PageLayout.Pane>
        <PageLayout.Content>
          <SelectedGameDisplay />
        </PageLayout.Content>
        <FriendsPane />
      </PageLayout>
    </ProviderStack>
  )
}

function ProviderStack({children}: PropsWithChildren) {
  return (
    <ThemeProvider>
      <BaseStyles>
        <SelectedFriendsProvider>
          <SelectedGameProvider>{children}</SelectedGameProvider>
        </SelectedFriendsProvider>
      </BaseStyles>
    </ThemeProvider>
  )
}

export default App

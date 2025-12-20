import type {PropsWithChildren} from 'react'
import {BaseStyles, Button, Link, PageLayout, ThemeProvider, Tooltip, Spinner} from '@primer/react'
import {useGetCurrentUser} from './hooks/use-get-current-user'
import './App.css'

function App() {
  const {data: currentUser, isPending} = useGetCurrentUser()

  return (
    <ProviderStack>
      <PageLayout>
        <PageLayout.Header>
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
          {isPending && <Spinner />}
        </PageLayout.Content>
      </PageLayout>
    </ProviderStack>
  )
}

function ProviderStack({children}: PropsWithChildren) {
  return (
    <ThemeProvider colorMode="dark">
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>
  )
}

export default App

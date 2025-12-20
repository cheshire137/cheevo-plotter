import {type FormEventHandler, useCallback, useState} from 'react'
import {Button, PageLayout, FormControl, Link, TextInput, Text} from '@primer/react'
import {useGetCurrentUser} from '../hooks/use-get-current-user'

function SteamLookupPage({onUsernameChange}: {onUsernameChange(newUsername: string): void}) {
  const [username, setUsername] = useState('')
  const {data: steamId} = useGetCurrentUser()

  const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault()
      onUsernameChange(username)
    },
    [onUsernameChange, username]
  )

  return (
    <PageLayout>
      <PageLayout.Header>
        <h1>Find Steam user</h1>
      </PageLayout.Header>
      <PageLayout.Content>
        <form onSubmit={onSubmit}>
          <FormControl required id="steam-username">
            <FormControl.Label>Steam user name:</FormControl.Label>
            <TextInput
              value={username}
              autoFocus
              autoComplete="off"
              placeholder="e.g., cheshire137"
              onChange={e => setUsername(e.target.value.trim())}
            />
            <Text as="p" fontSize="1" color="fg.subtle">
              The Steam profile must be public.
            </Text>
          </FormControl>
          <Button type="submit">Find user</Button>
        </form>
        {steamId === undefined && (
          <p>
            Or <Link href={`${import.meta.env.VITE_BACKEND_URL}/auth/steam`}>Sign in with Steam</Link>
          </p>
        )}
      </PageLayout.Content>
    </PageLayout>
  )
}

export default SteamLookupPage

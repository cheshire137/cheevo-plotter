import React, { useState } from 'react'
import { Button, PageLayout, FormControl, TextInput, Text } from '@primer/react'

interface Props {
  onUsernameChange(newUsername: string): void;
}

const SteamLookupPage = ({ onUsernameChange }: Props) => {
  const [username, setUsername] = useState("")

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onUsernameChange(username)
  }

  return <PageLayout>
    <PageLayout.Header>
      <h1>Find Steam user</h1>
    </PageLayout.Header>
    <PageLayout.Content>
      <form onSubmit={e => onSubmit(e)}>
        <FormControl id="steam-username">
          <FormControl.Label>Steam user name:</FormControl.Label>
          <TextInput value={username} autoFocus={true} autoComplete="off" required={true}
            placeholder="e.g., cheshire137" onChange={e => setUsername(e.target.value.trim())} />
          <Text as="p" fontSize="1" color="fg.subtle">The Steam profile must be public.</Text>
        </FormControl>
        <Button
          type="submit"
        >Find user</Button>
      </form>
    </PageLayout.Content>
  </PageLayout>
}

export default SteamLookupPage;

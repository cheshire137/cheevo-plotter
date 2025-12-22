import {Avatar, Link, PageHeader, Spinner, UnderlineNav} from '@primer/react'
import {useGetCurrentUser} from '../queries/use-get-current-user'
import './AppHeader.css'

export function AppHeader() {
  const {data: currentUser, isPending} = useGetCurrentUser()
  return (
    <PageHeader role="banner">
      <PageHeader.TitleArea>
        <PageHeader.Title as="h1">Cheevo plotter</PageHeader.Title>
      </PageHeader.TitleArea>
      <PageHeader.Actions>
        {isPending && <Spinner />}
        {currentUser ? (
          <span className="signed-in-as">
            Signed in as{' '}
            <Link href={currentUser.profileUrl}>
              {currentUser.avatarUrl.length > 0 && <Avatar src={currentUser.avatarUrl} />} {currentUser.name}
            </Link>
          </span>
        ) : (
          <form method="POST" id="logout-form" action={`${import.meta.env.VITE_BACKEND_URL}/user/logout`}></form>
        )}
      </PageHeader.Actions>
      <PageHeader.Navigation>
        <UnderlineNav aria-label="Main navigation">
          {currentUser ? (
            <UnderlineNav.Item as="button" form="logout-form" type="submit">
              Sign out
            </UnderlineNav.Item>
          ) : (
            <UnderlineNav.Item href={`${import.meta.env.VITE_BACKEND_URL}/auth/steam`}>
              Sign in with Steam
            </UnderlineNav.Item>
          )}
        </UnderlineNav>
      </PageHeader.Navigation>
    </PageHeader>
  )
}

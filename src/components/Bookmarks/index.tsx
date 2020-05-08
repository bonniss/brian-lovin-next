import * as React from 'react'
import {
  Bookmark,
  useDeleteBookmarkMutation,
  useEditBookmarkMutation,
  useAddBookmarkReactionMutation,
} from '~/graphql/types.generated'
import { Small, A } from '~/components/Typography'
import { useAuth } from '~/hooks/useAuth'
import { GET_BOOKMARKS } from '~/graphql/queries'
import { Input } from '../Overthought/Feedback/style'
import Grid from '~/components/Grid'

interface Props {
  bookmarks?: Array<Bookmark>
}

interface ListItemProps extends Props {
  editable: boolean
  bookmark: Bookmark
}

function BookmarkListItem(props: ListItemProps) {
  const { bookmark, editable } = props

  const [title, setTitle] = React.useState(bookmark.title)
  const [isEditing, setIsEditing] = React.useState(false)
  const [error, setError] = React.useState('')

  const [handleSave] = useEditBookmarkMutation({
    onCompleted: ({ editBookmark }) => {
      setTitle(editBookmark.title)
      setIsEditing(false)
    },
    onError({ message }) {
      const clean = message.replace('GraphQL error:', '')
      setError(clean)
    },
  })

  const [addReaction] = useAddBookmarkReactionMutation()

  const [handleDelete] = useDeleteBookmarkMutation({
    variables: { id: bookmark.id },
    update(cache) {
      const { bookmarks } = cache.readQuery({ query: GET_BOOKMARKS })
      cache.writeQuery({
        query: GET_BOOKMARKS,
        data: {
          bookmarks: bookmarks.filter((o) => o.id !== bookmark.id),
        },
      })
    },
  })

  function onChange(e) {
    error && setError('')
    setTitle(e.target.value)
  }

  function handleCancel() {
    setError('')
    setTitle(bookmark.title)
    setIsEditing(false)
  }

  function handleReaction() {
    return addReaction({
      variables: {
        id: bookmark.id,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        addBookmarkReaction: {
          __typename: 'Bookmark',
          ...bookmark,
          reactions: bookmark.reactions + 1,
        },
      },
    })
  }

  if (isEditing) {
    return (
      <Grid gap={4}>
        <Input defaultValue={title} onChange={onChange} />
        <Small>{bookmark.host || bookmark.url}</Small>
        {error && <Small style={{ color: 'var(--accent-red)' }}>{error}</Small>}
        <div style={{ display: 'flex' }}>
          <Small
            onClick={() =>
              handleSave({ variables: { title, id: bookmark.id } })
            }
            as={'a'}
          >
            Save
          </Small>
          <Small onClick={handleCancel} style={{ marginLeft: '12px' }} as={'a'}>
            Cancel
          </Small>
          <Small
            onClick={handleDelete}
            style={{
              marginLeft: '32px',
              color: 'var(--accent-red)',
            }}
            as={'a'}
          >
            Delete
          </Small>
        </div>
      </Grid>
    )
  }

  return (
    <Grid gap={4}>
      <A
        href={`${bookmark.url}?ref=brianlovin.com`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {bookmark.title || bookmark.url}
      </A>
      <Grid columns={`repeat(5, min-content)`} gap={16}>
        <Grid
          onClick={() => handleReaction()}
          style={{ alignItems: 'center', cursor: 'pointer' }}
          gap={2}
          columns={'16px auto'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="10"
            height="10"
          >
            {' '}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              fill={
                bookmark.reactions > 0
                  ? `var(--accent-red)`
                  : `var(--text-placeholder)`
              }
              d="M7.655 14.9159C7.65523 14.9161 7.65543 14.9162 8 14.25C8.34457 14.9162 8.34477 14.9161 8.34501 14.9159C8.12889 15.0277 7.87111 15.0277 7.655 14.9159ZM7.655 14.9159L8 14.25L8.34501 14.9159L8.34731 14.9147L8.35269 14.9119L8.37117 14.9022C8.38687 14.8939 8.40926 14.882 8.4379 14.8665C8.49516 14.8356 8.57746 14.7904 8.6812 14.7317C8.8886 14.6142 9.18229 14.442 9.53358 14.2199C10.2346 13.7767 11.1728 13.13 12.1147 12.3181C13.9554 10.7312 16 8.35031 16 5.5C16 2.83579 13.9142 1 11.75 1C10.2026 1 8.84711 1.80151 8 3.01995C7.15289 1.80151 5.79736 1 4.25 1C2.08579 1 0 2.83579 0 5.5C0 8.35031 2.04459 10.7312 3.8853 12.3181C4.82717 13.13 5.76538 13.7767 6.46642 14.2199C6.81771 14.442 7.1114 14.6142 7.3188 14.7317C7.42254 14.7904 7.50484 14.8356 7.5621 14.8665C7.59074 14.882 7.61313 14.8939 7.62883 14.9022L7.64731 14.9119L7.65269 14.9147L7.655 14.9159Z"
            ></path>
          </svg>
          <Small>{bookmark.reactions.toLocaleString()}</Small>
        </Grid>
        <Small style={{ color: 'var(--text-placeholder)' }}>/</Small>
        <A
          href={`https://${bookmark.host}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Small>{bookmark.host || bookmark.url}</Small>
        </A>
        {editable && (
          <React.Fragment>
            <Small style={{ color: 'var(--text-placeholder)' }}>/</Small>
            <Small onClick={() => setIsEditing(true)} as={'a'}>
              Edit
            </Small>
          </React.Fragment>
        )}
      </Grid>
    </Grid>
  )
}

export default function BookmarksList({ bookmarks }: Props) {
  if (!bookmarks || bookmarks.length === 0) return null
  const { isMe } = useAuth()

  return (
    <Grid gap={24}>
      {bookmarks.map((bookmark) => (
        <BookmarkListItem
          editable={isMe}
          key={bookmark.url}
          bookmark={bookmark}
        />
      ))}
    </Grid>
  )
}

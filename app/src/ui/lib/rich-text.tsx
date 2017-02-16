import * as React from 'react'

import { LinkEventHandler, LinkType } from './link-handler'

const EmojiRegex = /(:.*?:)/g
// TODO: refine this regex so email addresses are skipped
const UsernameRegex = /(@[a-zA-Z0-9\-]*)/g

interface IRichTextProps {
  readonly className?: string
  readonly emoji: Map<string, string>
  readonly children?: string
  readonly linkClicked?: LinkEventHandler
}

/**
 * A component which replaces any emoji shortcuts (e.g., :+1:) in its child text
 * with the appropriate image tag.
 */
export class RichText extends React.Component<IRichTextProps, void> {
  public render() {
    const children = this.props.children as string || ''
    return (
      <div className={this.props.className}>
        {emojificationNexus(children, this.props.emoji, this.props.linkClicked)}
      </div>
    )
  }
}

/** Shoutout to @robrix's naming expertise. */
function emojificationNexus(str: string, emoji: Map<string, string>, linkClicked?: LinkEventHandler): JSX.Element | null {
  // If we've been given an empty string then return null so that we don't end
  // up introducing an extra empty <span>.
  if (!str.length) { return null }

  const pieces = str.split(EmojiRegex)
  const elements = pieces.map((fragment, i) => {
    const path = emoji.get(fragment)
    if (path) {
      return [ <img key={i} alt={fragment} title={fragment} className='emoji' src={path}/> ]
    } else {
      return usernameNexus(fragment, i, linkClicked)
    }
  })

  return <span>{elements}</span>
}

function usernameNexus(str: string, i: number, linkClicked?: LinkEventHandler): ReadonlyArray<JSX.Element | string> {
  if (linkClicked === undefined) {
    return [ str ]
  } else {
  const pieces = str.split(UsernameRegex)
  return pieces.map((fragment, j) => {
    if (fragment.startsWith('@')) {
      const innerKey = `${i}-${j}`
      const user = fragment.substr(1)
      return <a
        key={innerKey}
        className='username'
        onClick={() => linkClicked({ kind: LinkType.User, user })}
        title={user}>
          {fragment}
        </a>
    } else {
      return fragment
    }
  })
  }
}

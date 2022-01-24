import Link from 'next/link'
import * as React from 'react'

import { GlobalNavigationContext } from '~/components/Providers'

export function NavigationLink({
  link: {
    href,
    label,
    icon: Icon,
    trailingAccessory: Accessory,
    trailingAction: Action,
    isActive,
    isExternal,
  },
}) {
  const { setIsOpen } = React.useContext(GlobalNavigationContext)
  return (
    <li
      className="flex items-stretch space-x-1"
      onClick={() => setIsOpen(false)}
    >
      <Link href={href}>
        <a
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className={`flex flex-1 items-center space-x-3 rounded-md px-2 py-1.5 text-sm font-medium  ${
            isActive
              ? 'bg-black text-white hover:bg-black hover:text-white dark:bg-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white'
              : 'text-gray-700 dark:text-gray-200 sm:hover:bg-gray-200 sm:hover:text-gray-900 sm:dark:hover:bg-gray-700 sm:dark:hover:text-gray-200'
          }`}
        >
          <span className="flex items-center justify-center">
            <Icon />
          </span>
          <span className="flex-1">{label}</span>
          {Accessory && (
            <span className="flex w-4 items-center justify-center text-black text-opacity-40 dark:text-white">
              <Accessory />
            </span>
          )}
        </a>
      </Link>
      {Action && <Action />}
    </li>
  )
}

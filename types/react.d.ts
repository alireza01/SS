import 'react'

declare module 'react' {
  export * from 'react'
  export { useEffect, useState } from 'react'
}

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    className?: string
  }
} 
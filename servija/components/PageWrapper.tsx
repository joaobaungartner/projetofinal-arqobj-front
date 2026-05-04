interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`max-w-screen-xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:py-10 ${className}`}>
      {children}
    </div>
  )
}

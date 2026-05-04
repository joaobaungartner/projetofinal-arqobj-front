interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`max-w-screen-xl mx-auto w-full px-4 py-6 md:px-6 md:py-8 ${className}`}>
      {children}
    </div>
  )
}

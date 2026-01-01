'use client'

import { Suspense } from 'react'
import { ZarinpalVerifyContent } from './ZarinpalVerifyContent'

export default function ZarinpalVerifyPage() {
  return (
    <div className="container min-h-[90vh] flex items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <ZarinpalVerifyContent />
      </Suspense>
    </div>
  )
}


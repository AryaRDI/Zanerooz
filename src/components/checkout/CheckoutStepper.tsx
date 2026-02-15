'use client'

import { useTranslation } from '@/i18n/useTranslation'
import { Check, CreditCard, MapPin } from 'lucide-react'
import React from 'react'

type Props = {
  currentStep: number
}

const steps = [
  { key: 'checkout.steps.shipping', icon: MapPin },
  { key: 'checkout.steps.payment', icon: CreditCard },
  { key: 'checkout.steps.confirm', icon: Check },
] as const

export const CheckoutStepper: React.FC<Props> = ({ currentStep }) => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isDone = stepNumber < currentStep
        const Icon = step.icon

        return (
          <React.Fragment key={index}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors
                  ${isDone ? 'border-primary bg-primary text-primary-foreground' : ''}
                  ${isActive ? 'border-primary bg-primary/10 text-primary' : ''}
                  ${!isDone && !isActive ? 'border-muted-foreground/30 text-muted-foreground/50' : ''}
                `}
              >
                {isDone ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`
                  hidden md:block text-xs font-medium whitespace-nowrap
                  ${isActive || isDone ? 'text-foreground' : 'text-muted-foreground/50'}
                `}
              >
                {t(step.key)}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-[2px] flex-1 mx-3 transition-colors
                  ${stepNumber < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'}
                `}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
